const fs = require('fs');

const files = [
  'src/app/(dashboard)/dashboard/content/page.tsx',
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/dashboard/projects/[id]/page.tsx',
  'src/app/(dashboard)/dashboard/projects/page.tsx',
  'src/app/actions/comment.ts',
  'src/app/actions/material.ts',
  'src/app/actions/team.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace implicit any single params
    content = content.replace(/\bm =>/g, '(m: any) =>');
    content = content.replace(/\bc =>/g, '(c: any) =>');
    content = content.replace(/\bt =>/g, '(t: any) =>');
    content = content.replace(/\bs =>/g, '(s: any) =>');
    content = content.replace(/\bmat =>/g, '(mat: any) =>');
    content = content.replace(/\bproject =>/g, '(project: any) =>');
    content = content.replace(/\bmember =>/g, '(member: any) =>');

    // Replace implicit any with parens
    content = content.replace(/\(m\) =>/g, '(m: any) =>');
    content = content.replace(/\(c\) =>/g, '(c: any) =>');
    content = content.replace(/\(t\) =>/g, '(t: any) =>');
    content = content.replace(/\(s\) =>/g, '(s: any) =>');
    content = content.replace(/\(mat\) =>/g, '(mat: any) =>');
    content = content.replace(/\(project\) =>/g, '(project: any) =>');
    content = content.replace(/\(member\) =>/g, '(member: any) =>');
    content = content.replace(/\(comment\) =>/g, '(comment: any) =>');

    // Replace multiple params
    content = content.replace(/\(t, i\) =>/g, '(t: any, i: number) =>');
    content = content.replace(/\(project, i\) =>/g, '(project: any, i: number) =>');
    content = content.replace(/\(member, i\) =>/g, '(member: any, i: number) =>');
    content = content.replace(/\(m, j\) =>/g, '(m: any, j: number) =>');

    // Replace Zod error properties
    content = content.replace(/\.error\.errors\?\.\[0\]\?\.message/g, '.error.issues?.[0]?.message');
    content = content.replace(/\.error\.errors\[0\]\?\.message/g, '.error.issues[0]?.message');

    fs.writeFileSync(file, content);
  }
});
console.log("Done");
