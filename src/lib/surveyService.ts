import { supabase } from './supabase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const EVENT_SELECT = '*, customers(name)';

function asSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function mapEvent(row: any) {
  const uiStatus =
    row.status === 'published' ? 'active' : row.status === 'closed' ? 'completed' : 'draft';

  return {
    id: row.id,
    customer_id: row.customer_id,
    title: row.title,
    workshop_date: row.event_date,
    event_date: row.event_date,
    objective: row.objective,
    status: uiStatus,
    event_status: row.status,
    public_slug: row.public_slug,
    access_code: row.access_code,
    created_by: row.created_by,
    created_at: row.created_at,
    published_at: row.published_at,
    customerName: row.customers?.name,
  };
}

function mapSurveyFromEvent(row: any) {
  return {
    id: row.id,
    workshop_id: row.id,
    template_id: null,
    title: row.title,
    description: row.objective || '',
    status: row.status,
    public_slug: row.public_slug,
    access_code: row.access_code,
    accessCode: row.access_code,
    published_at: row.published_at,
  };
}

async function throwIfError(error: any, operationType: OperationType, path: string) {
  if (!error) return;
  console.error('Supabase Error:', JSON.stringify({ operationType, path, error: error.message }));
  throw new Error(error.message || `Supabase ${operationType} failed at ${path}`);
}

export const surveyService = {
  createSlug: asSlug,

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    await throwIfError(error, OperationType.GET, 'auth.user');
    return data.user;
  },

  async claimAdminInvite() {
    const { data, error } = await supabase.rpc('claim_admin_invite');
    await throwIfError(error, OperationType.UPDATE, 'claim_admin_invite');
    return data;
  },

  async isCurrentUserAdmin() {
    const user = await this.getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('admin_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return false;
    return Boolean(data);
  },

  async getAdminProfiles() {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    await throwIfError(error, OperationType.LIST, 'admin_profiles');
    return data || [];
  },

  async getAdminInvites() {
    const { data, error } = await supabase
      .from('admin_invites')
      .select('*')
      .order('created_at', { ascending: false });
    await throwIfError(error, OperationType.LIST, 'admin_invites');
    return data || [];
  },

  async createAdminInvite(email: string) {
    const user = await this.getCurrentUser();
    const payload = {
      email: email.toLowerCase().trim(),
      invited_by: user?.id,
    };

    const { data, error } = await supabase
      .from('admin_invites')
      .upsert(payload, { onConflict: 'email' })
      .select('id')
      .single();

    await throwIfError(error, OperationType.CREATE, 'admin_invites');
    return data.id;
  },

  async createAdminUser(email: string, password: string) {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    return this.createAdminInvite(email);
  },

  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });
    await throwIfError(error, OperationType.LIST, 'customers');
    return data || [];
  },

  async createCustomer(data: any) {
    const { data: created, error } = await supabase
      .from('customers')
      .insert({
        name: data.name,
        industry: data.industry || null,
        region: data.region || null,
        notes: data.notes || null,
      })
      .select('id')
      .single();

    await throwIfError(error, OperationType.CREATE, 'customers');
    return created.id;
  },

  async getWorkshops(customerId: string) {
    const { data, error } = await supabase
      .from('events')
      .select(EVENT_SELECT)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    await throwIfError(error, OperationType.LIST, `customers/${customerId}/events`);
    return (data || []).map(mapEvent);
  },

  async getAllWorkshops() {
    const { data, error } = await supabase
      .from('events')
      .select(EVENT_SELECT)
      .order('created_at', { ascending: false });
    await throwIfError(error, OperationType.LIST, 'events');
    return (data || []).map(mapEvent);
  },

  async getWorkshop(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select(EVENT_SELECT)
      .eq('id', id)
      .maybeSingle();
    await throwIfError(error, OperationType.GET, `events/${id}`);
    return data ? mapEvent(data) : null;
  },

  async createWorkshop(customerId: string, data: any) {
    const slug = data.public_slug ? asSlug(data.public_slug) : null;
    const { data: created, error } = await supabase
      .from('events')
      .insert({
        customer_id: customerId,
        title: data.title,
        event_date: data.workshop_date || data.event_date || null,
        objective: data.objective || null,
        public_slug: slug,
        access_code: data.access_code || null,
        status: 'draft',
      })
      .select('id')
      .single();

    await throwIfError(error, OperationType.CREATE, `customers/${customerId}/events`);
    await this.copyTemplateQuestions(created.id);
    return created.id;
  },

  async deleteWorkshop(workshopId: string) {
    const { error } = await supabase.from('events').delete().eq('id', workshopId);
    await throwIfError(error, OperationType.DELETE, `events/${workshopId}`);
  },

  async copyTemplateQuestions(eventId: string) {
    const { data: template, error: templateError } = await supabase
      .from('survey_templates')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (templateError || !template) return;

    const { data: existing } = await supabase
      .from('event_questions')
      .select('id')
      .eq('event_id', eventId)
      .limit(1);

    if (existing && existing.length > 0) return;

    const { data: questions, error: questionsError } = await supabase
      .from('template_questions')
      .select('*')
      .eq('template_id', template.id)
      .order('order_index', { ascending: true });

    await throwIfError(questionsError, OperationType.LIST, `templates/${template.id}/questions`);
    if (!questions?.length) return;

    const { error } = await supabase.from('event_questions').insert(
      questions.map((q: any) => ({
        event_id: eventId,
        section: q.section,
        text: q.text,
        help_text: q.help_text,
        type: q.type,
        options: q.options,
        required: q.required,
        order_index: q.order_index,
        analysis_tag: q.analysis_tag,
        is_core: q.is_core,
      })),
    );

    await throwIfError(error, OperationType.CREATE, `events/${eventId}/questions`);
  },

  async getWorkshopSurveys(workshopId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', workshopId)
      .maybeSingle();
    await throwIfError(error, OperationType.LIST, `events/${workshopId}/survey`);
    return data ? [mapSurveyFromEvent(data)] : [];
  },

  async createWorkshopSurvey(workshopId: string, data: any) {
    const { error } = await supabase
      .from('events')
      .update({
        title: data.title,
        objective: data.description,
      })
      .eq('id', workshopId);
    await throwIfError(error, OperationType.UPDATE, `events/${workshopId}`);
    return workshopId;
  },

  async updateWorkshopSurvey(workshopId: string, _surveyId: string, data: any) {
    const { error } = await supabase
      .from('events')
      .update({
        title: data.title,
        objective: data.description,
        access_code: data.access_code || null,
      })
      .eq('id', workshopId);
    await throwIfError(error, OperationType.UPDATE, `events/${workshopId}`);
  },

  async getSurveyQuestions(workshopId: string, _surveyId: string) {
    const { data, error } = await supabase
      .from('event_questions')
      .select('*')
      .eq('event_id', workshopId)
      .order('order_index', { ascending: true });
    await throwIfError(error, OperationType.LIST, `events/${workshopId}/questions`);
    return data || [];
  },

  async addQuestion(workshopId: string, _surveyId: string, question: any) {
    const { data, error } = await supabase
      .from('event_questions')
      .insert({
        event_id: workshopId,
        section: question.section || 'General',
        text: question.text,
        type: question.type || 'long_text',
        options: question.options || [],
        required: question.required ?? true,
        order_index: question.order_index || 0,
        analysis_tag: question.analysis_tag || null,
        is_core: false,
      })
      .select('id')
      .single();
    await throwIfError(error, OperationType.CREATE, `events/${workshopId}/questions`);
    return data.id;
  },

  async deleteQuestion(workshopId: string, _surveyId: string, questionId: string) {
    const { error } = await supabase
      .from('event_questions')
      .delete()
      .eq('id', questionId)
      .eq('event_id', workshopId);
    await throwIfError(error, OperationType.DELETE, `events/${workshopId}/questions/${questionId}`);
  },

  async publishSurvey(workshopId: string, _surveyId: string, slug: string, accessCode?: string) {
    const cleanSlug = asSlug(slug);
    const { error } = await supabase
      .from('events')
      .update({
        status: 'published',
        public_slug: cleanSlug,
        access_code: accessCode || null,
        published_at: new Date().toISOString(),
      })
      .eq('id', workshopId);
    await throwIfError(error, OperationType.UPDATE, `events/${workshopId}/publish`);
    return cleanSlug;
  },

  async getResponses(workshopId: string, _surveyId: string) {
    const { data, error } = await supabase
      .from('event_responses')
      .select('*')
      .eq('event_id', workshopId)
      .order('submitted_at', { ascending: false });
    await throwIfError(error, OperationType.LIST, `events/${workshopId}/responses`);
    return data || [];
  },

  async getSurveyBySlug(slug: string) {
    const { data, error } = await supabase.rpc('get_public_event', { p_slug: asSlug(slug) });
    await throwIfError(error, OperationType.GET, `public/${slug}`);
    if (!data) return null;

    return {
      id: data.id,
      workshopId: data.id,
      workshopTitle: data.title,
      title: data.title,
      customerName: data.customer_name,
      public_slug: data.public_slug,
      accessCodeRequired: data.access_code_required,
      questions: data.questions || [],
    };
  },

  async submitResponse(workshopId: string, _surveyId: string, data: any) {
    const slug = data.public_slug || data.slug;
    const { data: responseId, error } = await supabase.rpc('submit_event_response', {
      p_slug: asSlug(slug),
      p_access_code: data.access_code || '',
      p_respondent_name: data.respondent_name || '',
      p_respondent_email: data.respondent_email || '',
      p_answers: data.answers || {},
      p_metadata: {
        ...(data.metadata || {}),
        event_id: workshopId,
      },
    });

    await throwIfError(error, OperationType.CREATE, `public/${slug}/responses`);
    return responseId;
  },

  async saveAnalysisRun(eventId: string, result: any, analysisType: 'summary' | 'individual', responseId?: string) {
    const { data, error } = await supabase
      .from('analysis_runs')
      .insert({
        event_id: eventId,
        response_id: responseId || null,
        analysis_type: analysisType,
        result,
      })
      .select('id')
      .single();

    await throwIfError(error, OperationType.CREATE, `events/${eventId}/analysis_runs`);
    return data.id;
  },
};
