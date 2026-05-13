import re
path = r'c:\Users\DELL\Downloads\Response-Port-main\Response-Port-main\frontend\src\pages\AdminDashboard.jsx'
content = open(path, 'r', encoding='utf-8').read()

# Replace Table Headers
content = content.replace('<th>Status</th>', '<th>Submission Date</th>')
content = content.replace('<th style={{ textAlign: \'center\' }}>Actions</th>', '<th style={{ textAlign: \'center\' }}>Details</th>')

# Replace Status Cell with Date
old_status_block = re.compile(r'<td>\s*<span style={{[^}]*}}>{c\.status}</span>\s*</td>', re.DOTALL)
content = old_status_block.sub('<td><span style={{ fontSize: \'0.9rem\', color: \'#64748B\' }}>{new Date(c.createdAt).toLocaleDateString()}</span></td>', content)

# Remove Approve/Reject Buttons
content = re.sub(r'<button onClick={() => handleUpdateStatus\(c\._id, \'approved\'\)}.*?</button>', '', content)
content = re.sub(r'<button onClick={() => handleUpdateStatus\(c\._id, \'rejected\'\)}.*?</button>', '', content)

# Enhance View Details Button
content = content.replace('title="Details"', 'style={{ background: \'#DBEAFE\', color: \'#2563EB\', border: \'none\', padding: \'10px 18px\', borderRadius: \'8px\', cursor: \'pointer\', fontWeight: \'bold\' }}')
content = content.replace('<FileText size={18}/>', 'View Full Response')

# Remove handleUpdateStatus from AdminDashboard if desired (optional)

open(path, 'w', encoding='utf-8').write(content)
print("Done")
