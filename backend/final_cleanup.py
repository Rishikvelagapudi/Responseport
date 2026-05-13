import re
path = r'c:\Users\DELL\Downloads\Response-Port-main\Response-Port-main\frontend\src\pages\AdminDashboard.jsx'
content = open(path, 'r', encoding='utf-8').read()

# Fix stats card
content = content.replace('{pendingCount}</div>', '{cases.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}</div>')
content = content.replace('Pending Submissions</div>', 'Today\'s Submissions</div>')

# Fix status cell to show date
pattern = re.compile(r'<td>\s*<span style={{[^}]*}}>Submitted</span>\s*</td>', re.DOTALL)
content = pattern.sub('<td><span style={{ fontSize: \'0.9rem\', color: \'#64748B\' }}>{new Date(c.createdAt).toLocaleDateString()}</span></td>', content)

open(path, 'w', encoding='utf-8').write(content)
print("Done")
