# Testing Checklist - New Features

## 🧪 Complete Testing Guide

Use this checklist to verify all three new features are working correctly.

---

## ✅ Feature 1: Bulk Question Upload

### Test 1.1: Upload When Creating New Event

**Steps:**
1. [ ] Navigate to `/admin/dashboard`
2. [ ] Click "Create New Event"
3. [ ] Fill in:
   - Title: "Test Bulk Upload Event"
   - Description: "Testing bulk upload feature"
4. [ ] Scroll to "Bulk Upload Questions" section
5. [ ] Click "Choose Excel File"
6. [ ] Select `sample_questions_template.csv` or your own Excel file
7. [ ] Verify you see: "✓ X questions loaded from file"
8. [ ] Verify preview shows question list
9. [ ] Click "Create Event"
10. [ ] Verify redirect to event detail page
11. [ ] Verify all uploaded questions appear in Questions section

**Expected Results:**
- ✅ File uploads successfully
- ✅ Question count is correct
- ✅ Preview shows all questions
- ✅ Event is created
- ✅ All questions appear in event

**Potential Issues:**
- ❌ File format not recognized → Check file extension (.xlsx or .xls)
- ❌ Questions not loading → Check Excel column names (question, type, options, required)
- ❌ Error on create → Check browser console for details

---

### Test 1.2: Upload to Existing Event

**Steps:**
1. [ ] Open an existing event detail page
2. [ ] In Questions section header, click "Bulk Upload" button
3. [ ] Select an Excel file with questions
4. [ ] Wait for upload to complete
5. [ ] Verify success message appears
6. [ ] Verify new questions appear in the list
7. [ ] Check question order numbers are correct

**Expected Results:**
- ✅ Upload button is visible
- ✅ File uploads successfully
- ✅ Success message shows
- ✅ Questions are added to existing list
- ✅ Order numbers are sequential

**Potential Issues:**
- ❌ Button not visible → Refresh page
- ❌ Upload fails → Check file format
- ❌ Questions not appearing → Refresh page

---

### Test 1.3: Excel Format Validation

**Test different Excel formats:**

1. [ ] **Valid format** - All columns correct
   - Expected: ✅ Success

2. [ ] **Missing 'question' column**
   - Expected: ❌ Error or empty questions

3. [ ] **Invalid type** (e.g., "audio" instead of "voice")
   - Expected: ⚠️ Defaults to "text"

4. [ ] **Multiple-choice without options**
   - Expected: ⚠️ Creates question with empty options

5. [ ] **Empty rows**
   - Expected: ⚠️ Skipped

6. [ ] **Special characters in questions**
   - Expected: ✅ Handled correctly

**Create test Excel files for each scenario**

---

## ✅ Feature 2: Improved Excel Export

### Test 2.1: Basic Export

**Prerequisites:**
- Event with at least 3 responses
- Each response has answers to all questions

**Steps:**
1. [ ] Navigate to event detail page
2. [ ] Verify responses are visible
3. [ ] Click "Excel" button in Responses section
4. [ ] Wait for download
5. [ ] Open downloaded .xlsx file
6. [ ] Verify file structure

**Expected Results:**
- ✅ File downloads successfully
- ✅ Filename format: `{slug}_responses_{date}.xlsx`
- ✅ One row per respondent
- ✅ Columns: Name | Email | Q1: Question | Q2: Question | ... | Submitted At
- ✅ All answers are in correct columns
- ✅ No duplicate rows
- ✅ Timestamps are formatted correctly

**Verification Checklist:**
```
Row 1 (Header):
[ ] Name
[ ] Email
[ ] Q1: [Question Text]
[ ] Q2: [Question Text]
[ ] ...
[ ] Submitted At

Row 2 (First Response):
[ ] Respondent name
[ ] Respondent email
[ ] Answer to Q1
[ ] Answer to Q2
[ ] ...
[ ] Timestamp

Row 3 (Second Response):
[ ] Different respondent
[ ] Different email
[ ] Their answers
[ ] Their timestamp
```

---

### Test 2.2: Edge Cases

**Test with:**

1. [ ] **No responses**
   - Expected: Empty file or message

2. [ ] **One response**
   - Expected: Header + 1 data row

3. [ ] **100+ responses**
   - Expected: All rows present, no truncation

4. [ ] **Long answers** (500+ characters)
   - Expected: Full text in cell

5. [ ] **Special characters** (emojis, quotes, commas)
   - Expected: Properly escaped

6. [ ] **Voice responses** (audio URLs)
   - Expected: URL in cell

7. [ ] **Unanswered questions**
   - Expected: "No answer" or empty cell

---

### Test 2.3: Data Integrity

**Verify:**
1. [ ] Response count matches UI
2. [ ] All respondent names are correct
3. [ ] All emails are correct
4. [ ] Answers match what's shown in UI
5. [ ] No data is missing
6. [ ] No data is duplicated
7. [ ] Column order matches question order

---

## ✅ Feature 3: Enhanced AI Analysis

### Test 3.1: Basic Analysis

**Prerequisites:**
- Event with at least 5 responses
- Gemini API key configured

**Steps:**
1. [ ] Navigate to event detail page
2. [ ] Verify responses exist
3. [ ] Click "Analyze" button (sparkle icon)
4. [ ] Wait for processing (5-10 seconds)
5. [ ] Verify loading indicator appears
6. [ ] Wait for download
7. [ ] Open downloaded .md file

**Expected Results:**
- ✅ Button is clickable
- ✅ Loading indicator shows
- ✅ File downloads after processing
- ✅ Filename format: `{slug}_analysis_{date}.md`
- ✅ File opens in text editor

---

### Test 3.2: Markdown Content Verification

**Check the .md file contains:**

**Header Section:**
- [ ] Title: "Survey Analysis Report: [Event Title]"
- [ ] Generated date
- [ ] Event title
- [ ] Event status
- [ ] Total response count

**AI Analysis Section:**
- [ ] Executive Summary (2-3 paragraphs)
- [ ] Key Themes (3-5 themes with descriptions)
- [ ] Use Cases (with priorities)
- [ ] Recommendations (numbered list)

**NEW Sections:**
- [ ] "Survey Questions" section
- [ ] All questions listed (Q1, Q2, Q3...)
- [ ] "All User Responses" section
- [ ] Each response has:
  - [ ] Response number and name
  - [ ] Email
  - [ ] Submitted timestamp
  - [ ] All questions with answers

**Footer:**
- [ ] Methodology section
- [ ] Platform attribution

---

### Test 3.3: Response Details Verification

**For each response in the markdown:**

1. [ ] **Response header**
   - Format: "### Response X: [Name]"
   - Name matches Excel export
   
2. [ ] **Email line**
   - Format: "**Email:** [email]"
   - Email matches Excel export

3. [ ] **Timestamp line**
   - Format: "**Submitted:** [date and time]"
   - Timestamp is readable

4. [ ] **Question-Answer pairs**
   - Format: "**Q1: [Question]**\n[Answer]"
   - All questions included
   - All answers included
   - Order matches question order

5. [ ] **Formatting**
   - Proper markdown syntax
   - Readable spacing
   - No broken formatting

---

### Test 3.4: Edge Cases

**Test with:**

1. [ ] **Minimum responses** (1-2 responses)
   - Expected: Analysis still works, may be less detailed

2. [ ] **Many responses** (50+)
   - Expected: All responses included, file may be large

3. [ ] **Long answers**
   - Expected: Full text included, properly formatted

4. [ ] **Special characters**
   - Expected: Properly escaped in markdown

5. [ ] **Voice responses**
   - Expected: Audio URL shown

6. [ ] **Empty answers**
   - Expected: "No answer" shown

7. [ ] **API failure**
   - Expected: Error message, no download

---

### Test 3.5: AI Quality Check

**Verify AI analysis is:**
- [ ] Relevant to the responses
- [ ] Coherent and well-written
- [ ] Identifies actual themes from responses
- [ ] Provides actionable recommendations
- [ ] Uses proper grammar and formatting

---

## 🔄 Integration Tests

### Test 4.1: Complete Workflow

**Full end-to-end test:**

1. [ ] **Create event with bulk upload**
   - Upload 10 questions via Excel
   - Verify all questions created

2. [ ] **Publish event**
   - Change status to published
   - Verify public URL works

3. [ ] **Submit responses**
   - Submit 5 test responses
   - Use different names and emails
   - Answer all questions

4. [ ] **Export to Excel**
   - Download Excel file
   - Verify row-based format
   - Verify all 5 responses present

5. [ ] **Run AI analysis**
   - Click Analyze button
   - Download markdown file
   - Verify all sections present
   - Verify all 5 responses included

6. [ ] **Compare exports**
   - Excel and Markdown should have same data
   - Names should match
   - Emails should match
   - Answers should match

---

### Test 4.2: Multiple Events

**Test with multiple events:**

1. [ ] Create Event A with bulk upload
2. [ ] Create Event B with manual questions
3. [ ] Add responses to both
4. [ ] Export both to Excel
5. [ ] Analyze both
6. [ ] Verify files are separate and correct

---

### Test 4.3: Browser Compatibility

**Test in different browsers:**

- [ ] **Chrome**
  - Bulk upload works
  - Excel export works
  - Markdown download works

- [ ] **Firefox**
  - All features work

- [ ] **Safari**
  - All features work

- [ ] **Edge**
  - All features work

---

## 📊 Performance Tests

### Test 5.1: Large File Upload

**Test bulk upload with:**
- [ ] 10 questions → Should be instant
- [ ] 50 questions → Should take < 2 seconds
- [ ] 100 questions → Should take < 5 seconds
- [ ] 500 questions → Should complete (may take longer)

---

### Test 5.2: Large Export

**Test Excel export with:**
- [ ] 10 responses → Instant
- [ ] 100 responses → < 2 seconds
- [ ] 500 responses → < 5 seconds
- [ ] 1000 responses → Should complete

---

### Test 5.3: AI Analysis Performance

**Test analysis with:**
- [ ] 5 responses → 5-10 seconds
- [ ] 20 responses → 10-15 seconds
- [ ] 50 responses → 15-30 seconds
- [ ] 100 responses → May take longer, should complete

---

## 🐛 Bug Tracking

**If you find issues, document:**

1. **Issue Description:**
   - What happened?
   - What was expected?

2. **Steps to Reproduce:**
   - Exact steps taken
   - Files used (if applicable)

3. **Environment:**
   - Browser and version
   - Operating system
   - File size/type

4. **Screenshots/Logs:**
   - Browser console errors
   - Network tab errors
   - Screenshots of issue

---

## ✅ Final Checklist

**Before marking as complete:**

- [ ] All Test 1.x passed (Bulk Upload)
- [ ] All Test 2.x passed (Excel Export)
- [ ] All Test 3.x passed (AI Analysis)
- [ ] All Test 4.x passed (Integration)
- [ ] All Test 5.x passed (Performance)
- [ ] No critical bugs found
- [ ] Documentation reviewed
- [ ] Sample files tested

---

## 🎉 Testing Complete!

If all tests pass, the features are ready for production use!

**Next Steps:**
1. Deploy to production
2. Monitor for issues
3. Gather user feedback
4. Plan future enhancements
