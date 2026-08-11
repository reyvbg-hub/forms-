const fs = require('fs');
let content = fs.readFileSync('src/pages/Builder.tsx', 'utf8');

const oldOptions = `<option value="text">Short answer</option>
              <option value="long_text">Paragraph</option>
              <option value="multiple_choice">Multiple choice</option>
              <option value="checkboxes">Checkboxes</option>
              <option value="dropdown">Dropdown</option>`;

const newOptions = `<option value="text">Short answer</option>
              <option value="long_text">Paragraph</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="date">Date</option>
              <option value="number">Number</option>
              <option value="multiple_choice">Multiple choice</option>
              <option value="checkboxes">Checkboxes</option>
              <option value="dropdown">Dropdown</option>`;

content = content.replace(oldOptions, newOptions);

fs.writeFileSync('src/pages/Builder.tsx', content);
