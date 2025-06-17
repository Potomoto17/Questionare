hbs.handlebars.registerHelper('formatDate', function(date){
    if(!date) return 'N/A';
    return new Date(date).toLocaleDateString('sl-SI',{
      year:'numeric',month:'long',day:'numeric',
      hour:'2-digit',minute:'2-digit'
    });
  });
  