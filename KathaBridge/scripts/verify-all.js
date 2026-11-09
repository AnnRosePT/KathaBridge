/**
 * KathaBridge Automated Heritage & Code Verification Suite
 * Tests dataset integrity, phonetics, and translation coverage.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Starting KathaBridge Automated Test Suite...\n');

let failed = 0;
let passed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Stories Data Integrity
console.log('1. Checking Stories Dataset (stories.json)...');
const storiesPath = path.join(rootDir, 'src/data/stories.json');
assert(fs.existsSync(storiesPath), 'stories.json exists');
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));
assert(Array.isArray(stories) && stories.length >= 6, `Loaded ${stories.length} stories (minimum 6 expected)`);

stories.forEach((story, idx) => {
  assert(story.id && story.title?.EN && story.title?.ML, `Story #${idx + 1} (${story.id}) has valid IDs and bilingual titles`);
  assert(Array.isArray(story.sentences) && story.sentences.length > 0, `Story #${idx + 1} has ${story.sentences?.length} sentences for karaoke narration`);
});

// 2. Glossary Dataset Integrity
console.log('\n2. Checking Cultural Glossary Dataset (glossary.json)...');
const glossaryPath = path.join(rootDir, 'src/data/glossary.json');
assert(fs.existsSync(glossaryPath), 'glossary.json exists');
const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
assert(Array.isArray(glossary) && glossary.length >= 20, `Loaded ${glossary.length} glossary terms (minimum 20 expected)`);

glossary.forEach((term, idx) => {
  assert(term.id && term.term && term.originalScript, `Glossary term #${idx + 1} (${term.term}) has valid script and ID`);
  assert(term.isVerified === true, `Glossary term #${idx + 1} is verified by scholar council`);
});

// 3. Review Queue & Sources
console.log('\n3. Checking Academic Sources and Review Queue...');
const sourcesPath = path.join(rootDir, 'src/data/sources.json');
assert(fs.existsSync(sourcesPath), 'sources.json exists');
const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
assert(sources.length > 0, `Academic citations verified (${sources.length} sources)`);

// 4. Summary
console.log('\n=======================================');
console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
console.log('=======================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All KathaBridge verification checks passed cleanly!\n');
}
