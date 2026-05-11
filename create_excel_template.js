// Script to create Excel template for bulk question upload
import XLSX from 'xlsx';

// Sample data
const data = [
  {
    question: 'What is your role in the organization?',
    type: 'multiple-choice',
    options: 'Manager,Developer,Designer,Analyst,Other',
    required: 'yes'
  },
  {
    question: 'How many years of experience do you have?',
    type: 'text',
    options: '',
    required: 'yes'
  },
  {
    question: 'What are your main challenges with current tools?',
    type: 'text',
    options: '',
    required: 'yes'
  },
  {
    question: 'Would you like to provide voice feedback?',
    type: 'voice',
    options: '',
    required: 'no'
  },
  {
    question: 'Which features are most important to you?',
    type: 'multiple-choice',
    options: 'Performance,Security,Ease of Use,Cost,Support',
    required: 'yes'
  },
  {
    question: 'What is your department?',
    type: 'multiple-choice',
    options: 'Engineering,Sales,Marketing,HR,Operations',
    required: 'yes'
  },
  {
    question: 'Any additional comments or suggestions?',
    type: 'text',
    options: '',
    required: 'no'
  },
  {
    question: 'Rate your overall satisfaction',
    type: 'multiple-choice',
    options: 'Very Satisfied,Satisfied,Neutral,Dissatisfied,Very Dissatisfied',
    required: 'yes'
  }
];

// Create workbook and worksheet
const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

// Set column widths
worksheet['!cols'] = [
  { wch: 50 }, // question
  { wch: 20 }, // type
  { wch: 50 }, // options
  { wch: 10 }  // required
];

// Write file
XLSX.writeFile(workbook, 'sample_questions_template.xlsx');
console.log('✅ Excel template created: sample_questions_template.xlsx');
