import { supabase } from './supabase';
import type { Admin, Event, Question, Response, EventWithQuestions, GroupedResponse } from '../types';

// Helper to create URL-safe slugs
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

// ============================================
// ADMIN AUTHENTICATION
// ============================================

export async function adminSignup(name: string, email: string, password: string): Promise<string> {
  const { data, error } = await supabase
    .from('admins')
    .insert([{ name, email, password }])
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  
  // Store admin session in localStorage
  localStorage.setItem('adminId', data.id);
  localStorage.setItem('adminEmail', email);
  localStorage.setItem('adminName', name);
  
  return data.id;
}

export async function adminLogin(email: string, password: string): Promise<Admin> {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !data) throw new Error('Invalid credentials');
  
  // Store admin session in localStorage
  localStorage.setItem('adminId', data.id);
  localStorage.setItem('adminEmail', data.email);
  localStorage.setItem('adminName', data.name);
  
  return data;
}

export function adminLogout(): void {
  localStorage.removeItem('adminId');
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('adminName');
}

export function getAdminSession(): { id: string; email: string; name: string } | null {
  const id = localStorage.getItem('adminId');
  const email = localStorage.getItem('adminEmail');
  const name = localStorage.getItem('adminName');
  
  if (!id || !email || !name) return null;
  return { id, email, name };
}

export function isAdminAuthenticated(): boolean {
  return !!localStorage.getItem('adminId');
}

// ============================================
// EVENT MANAGEMENT
// ============================================

export async function createEvent(data: {
  title: string;
  description?: string;
  slug?: string;
}): Promise<string> {
  const session = getAdminSession();
  if (!session) throw new Error('Not authenticated');

  const slug = data.slug || createSlug(data.title);

  // Verify admin exists in database
  const { data: adminExists } = await supabase
    .from('admins')
    .select('id')
    .eq('id', session.id)
    .single();

  if (!adminExists) {
    throw new Error('Admin account not found. Please login again.');
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert([{
      admin_id: session.id,
      title: data.title,
      description: data.description,
      slug,
      status: 'draft'
    }])
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return event.id;
}

export async function getEvents(): Promise<Event[]> {
  const session = getAdminSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('admin_id', session.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) return null;
  return data;
}

export async function updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId);

  if (error) throw new Error(error.message);
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) throw new Error(error.message);
}

export async function publishEvent(eventId: string): Promise<void> {
  await updateEvent(eventId, { status: 'published' });
}

// ============================================
// QUESTION MANAGEMENT
// ============================================

export async function addQuestion(eventId: string, question: {
  question_text: string;
  question_type: 'text' | 'voice' | 'multiple-choice';
  options?: string[];
  order_number: number;
  is_required?: boolean;
}): Promise<string> {
  const { data, error } = await supabase
    .from('questions')
    .insert([{
      event_id: eventId,
      is_required: question.is_required ?? true,
      is_default: false,
      ...question
    }])
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function getQuestions(eventId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('event_id', eventId)
    .order('order_number', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateQuestion(questionId: string, updates: Partial<Question>): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', questionId);

  if (error) throw new Error(error.message);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  // Don't allow deleting default questions
  const { data: question } = await supabase
    .from('questions')
    .select('is_default')
    .eq('id', questionId)
    .single();

  if (question?.is_default) {
    throw new Error('Cannot delete default questions (Name and Email)');
  }

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  if (error) throw new Error(error.message);
}

// ============================================
// PUBLIC SURVEY ACCESS
// ============================================

export async function getEventBySlug(slug: string): Promise<EventWithQuestions | null> {
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (eventError || !event) return null;

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('event_id', event.id)
    .order('order_number', { ascending: true });

  if (questionsError) return null;

  return {
    ...event,
    questions: questions || []
  };
}

// ============================================
// RESPONSE MANAGEMENT
// ============================================

export async function submitResponse(data: {
  event_id: string;
  question_id: string;
  session_id: string;
  responder_name?: string;
  responder_email?: string;
  answer_text?: string;
  answer_audio_url?: string;
  response_type: 'text' | 'voice';
}): Promise<string> {
  const { data: response, error } = await supabase
    .from('responses')
    .insert([data])
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return response.id;
}

export async function getResponses(eventId: string): Promise<Response[]> {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getResponsesWithQuestions(eventId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('responses')
    .select(`
      *,
      questions (
        question_text,
        question_type
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getGroupedResponses(eventId: string): Promise<GroupedResponse[]> {
  const { data, error } = await supabase
    .from('responses')
    .select(`
      *,
      questions (
        question_text,
        question_type,
        order_number
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  
  // Group responses by session_id
  const grouped = new Map<string, GroupedResponse>();
  
  (data || []).forEach((response: any) => {
    if (!grouped.has(response.session_id)) {
      grouped.set(response.session_id, {
        session_id: response.session_id,
        responder_name: response.responder_name,
        responder_email: response.responder_email,
        created_at: response.created_at,
        answers: []
      });
    }
    
    const group = grouped.get(response.session_id)!;
    group.answers.push({
      question_id: response.question_id,
      question_text: response.questions?.question_text || 'Unknown',
      question_type: response.questions?.question_type || 'text',
      answer_text: response.answer_text,
      answer_audio_url: response.answer_audio_url,
      response_type: response.response_type
    });
  });
  
  // Sort answers within each group by question order
  return Array.from(grouped.values()).map(group => ({
    ...group,
    answers: group.answers.sort((a, b) => {
      // Name and Email should come first
      const aIsDefault = a.question_text === 'Your Name' || a.question_text === 'Your Email';
      const bIsDefault = b.question_text === 'Your Name' || b.question_text === 'Your Email';
      if (aIsDefault && !bIsDefault) return -1;
      if (!aIsDefault && bIsDefault) return 1;
      return 0;
    })
  }));
}
