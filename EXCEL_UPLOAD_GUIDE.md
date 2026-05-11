# Excel Upload Guide for Bulk Questions

## Overview
You can now upload questions in bulk using an Excel file (.xlsx or .xls) when creating a new event or adding questions to an existing event.

## Excel File Format

Your Excel file should have the following columns:

| Column Name | Required | Description | Valid Values |
|------------|----------|-------------|--------------|
| `question` or `Question` | Yes | The question text | Any text |
| `type` or `Type` | No | Type of question | `text`, `voice`, `multiple-choice` (default: `text`) |
| `options` or `Options` | No | Comma-separated options for multiple-choice | e.g., `Option A,Option B,Option C` |
| `required` or `Required` | No | Whether the question is required | `yes` or `no` (default: `yes`) |

## Sample Excel Template

Here's an example of how your Excel file should look:

| question | type | options | required |
|----------|------|---------|----------|
| What is your role in the organization? | multiple-choice | Manager,Developer,Designer,Other | yes |
| How many years of experience do you have? | text | | yes |
| What are your main challenges? | text | | yes |
| Would you like to provide voice feedback? | voice | | no |
| Which tools do you currently use? | multiple-choice | Tool A,Tool B,Tool C,Tool D | yes |

## How to Use

### When Creating a New Event:
1. Go to "Create New Event"
2. Fill in the event title and description
3. Click "Choose Excel File" under "Bulk Upload Questions"
4. Select your Excel file
5. Review the loaded questions
6. Click "Create Event"

### When Adding to Existing Event:
1. Open the event detail page
2. In the Questions section, click "Bulk Upload" button
3. Select your Excel file
4. Questions will be automatically added to the event

## Tips

- **Column names are case-insensitive**: You can use `question`, `Question`, or `QUESTION`
- **Default values**: If you don't specify `type`, it defaults to `text`. If you don't specify `required`, it defaults to `yes`
- **Multiple-choice options**: Separate options with commas (e.g., `Option 1,Option 2,Option 3`)
- **Empty cells**: If a cell is empty, the default value will be used
- **Order**: Questions will be added in the order they appear in the Excel file

## Example Download

You can create a sample Excel file with the structure above and save it as a template for future use.

## Troubleshooting

**Error: "Failed to parse Excel file"**
- Make sure your file is in .xlsx or .xls format
- Check that you have a `question` column
- Verify that there are no special characters causing issues

**Questions not appearing:**
- Make sure the `question` column has text in it
- Check that the file uploaded successfully (you should see a confirmation)
- Refresh the page to see the newly added questions

**Multiple-choice options not working:**
- Ensure options are comma-separated
- Make sure the `type` column is set to `multiple-choice`
- Check for extra spaces (they will be trimmed automatically)
