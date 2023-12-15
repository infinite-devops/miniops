function HtmlHelper() {

    this.createTableFromArray = (data) => {
  
      const [headings, ...rows] = data;
  
      var cells = data.map(cell => `<${type}>${cell}</${type}>`).join('');  
      var body = data.map(row => `<tr>${getCells(row, 'td')}</tr>`).join('');
      return `
            <table>
              <thead>${cells}</thead>
              <tbody>${body}</tbody>
            </table>
          `;
    }

    this.createTableFromObject = (obj) => {
  
        var body="";
        for(var key in obj){
          body += `<tr><td><strong>${key}</strong></td><td>${obj[key]}</td></tr>`;
        }  

        return `
              <table border=1 >
                <tbody>${body}</tbody>
              </table>
            `;
      }    
  
  }
  
  module.exports = HtmlHelper;