import re
path = r'c:\Users\DELL\Downloads\Response-Port-main\Response-Port-main\frontend\src\pages\AdminDashboard.jsx'
content = open(path, 'r', encoding='utf-8').read()

# Replace the specific broken block
pattern = re.compile(r'<td>\s*<span style={{[^}]*}}>Submitted</span>\s*</td>\s*<td style={{ textAlign: \'center\' }}>\s*<div style={{[^}]*}}>\s*<button onClick={() => handleUpdateStatus\(c\._id, \'approved\'\)}[^>]*>.*?</button>\s*<button onClick={() => handleUpdateStatus\(c\._id, \'rejected\'\)}[^>]*>.*?</button>\s*<button onClick={() => {.*?}} style={{[^}]*}} style={{[^}]*}}>View Full Response</button>\s*</div>\s*</td>', re.DOTALL)

replacement = """                            <td>
                               <span style={{ fontSize: '0.9rem', color: '#64748B' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                               <button onClick={() => {
                                 let d = c.data;
                                 if (typeof d === 'string') try { d = JSON.parse(d); } catch(e) { d = {}; }
                                 setSelectedFile({ type: 'json', data: JSON.stringify(d) });
                               }} style={{ background: '#DBEAFE', color: '#2563EB', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>View Full Response</button>
                            </td>"""

content = pattern.sub(replacement, content)
open(path, 'w', encoding='utf-8').write(content)
print("Done")
