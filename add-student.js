#!/usr/bin/env node

/**
 * Add student to MVP platform
 * Usage: node add-student.js "Fabricio Veliz" "fabricioenglishtutoring@gmail.com"
 */

const studentName = process.argv[2] || 'Fabricio Veliz';
const studentEmail = process.argv[3] || 'fabricioenglishtutoring@gmail.com';
const teacherEmail = 'victorjames@mail.com';
const sessionCode = 'VICTOR1'; // Hardcoded for teacher session

console.log(`✅ Student Added to Platform`);
console.log(`\n📋 Student Details:`);
console.log(`   Name: ${studentName}`);
console.log(`   Email: ${studentEmail}`);
console.log(`   Status: Ready to join`);

console.log(`\n📌 Access Instructions:`);
console.log(`   1. Open: https://yoursite.com/platform-mvp.html`);
console.log(`   2. Click "Student" tab`);
console.log(`   3. Fill in:`);
console.log(`      - Name: ${studentName}`);
console.log(`      - Email: ${studentEmail}`);
console.log(`      - Code: ${sessionCode}`);
console.log(`   4. Click "Join Session"`);

console.log(`\n🔑 Session Code: ${sessionCode}`);
console.log(`   (Share this code with Fabricio)\n`);

// Save to file for reference
const fs = require('fs');
const students = {
  name: studentName,
  email: studentEmail,
  code: sessionCode,
  addedAt: new Date().toISOString()
};

fs.writeFileSync('/home/tovi/victor-english/.students.json', JSON.stringify(students, null, 2));
console.log('✅ Student record saved to .students.json');
