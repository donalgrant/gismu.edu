

// google.load("jquery", "1.3.1");

// menu
$(document).ready(function(){

    $("#Filter").hide();

    $("#Card_menu,#Filter_menu").click(function(e) {
	e.preventDefault();
	
	$("#menu ul li a").each(function() {
	    $(this).removeClass("active");	
	});
	
	$(this).addClass("active");
	
	$("#Card").toggle();
	$("#Filter").toggle();
    });

});


var gismu=[ ];
var entries=[ ];

function fixedGismu() {
// use this when we aren't on a web-server, and so can't read in an XML file

  entries = [ 'klama', 'gismu', 'kajdi' ];
  fields = [ 'gismu', 'rafsi', 'gloss', 'def', 'notes' ];
  for (var e in entries) {
    for (var l in fields) {
      var g=entries[e]+'.'+fields[l];
      gismu[g] = entries[e]+' entry for '+fields[l];
    }
    gismu[entries[e]+'.entry_num']=e;
    gismu[entries[e]+'.xref']='klama, kajdi';
  }
}

function initGismu() {
  xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET","gismu.xml",false);
  xmlhttp.send();
  xmlDoc=xmlhttp.responseXML; 
  var x=xmlDoc.getElementsByTagName("item");

  gismu = [ ];
  entries=[ ];
  
  for (var i=0; i<x.length; i++) {
  
    var e=x[i].getElementsByTagName("gismu")[0].childNodes[0].nodeValue;
    entries.push(e);
    var fields = [ 'gismu', 'rafsi', 'gloss', 'def', 'xref', 'notes' ];
    for (var l in fields) {
      var g=e+'.'+fields[l];
      console.log(g);
      gismu[g] = x[i].getElementsByTagName(fields[l])[0].childNodes[0].nodeValue;
      console.log(gismu);
    }
    gismu[e+'.entry_num']=i;
  
  }

}

var current_i;

function newGismu() {
  var gr=document.getElementById('gismu_label').value;
  for (e in entries) {
    console.log(gr); console.log(e); console.log(entries[e]); console.log(entries[e].match(gr));
    if (entries[e].match(gr)) {
      current_i=e;
      console.log('current_i set to '+current_i);
      updateGismu();
      return;
    }
  }
}

function updateGismu() {

  var e = entries[current_i];

  document.getElementById('rafsi_label').innerHTML='<div class="label_title">rafsi:</div>'        +gismu[e+'.rafsi'];
  document.getElementById('gloss_label').innerHTML='<div class="label_title">English Gloss:</div>'+gismu[e+'.gloss'];
  document.getElementById('def_label'  ).innerHTML='<div class="label_title">Full Def:</div>'     +gismu[e+'.def'];
  document.getElementById('notes_label').innerHTML='<div class="label_title">Notes:</div>'        +gismu[e+'.notes'];

  document.getElementById('gismu_label').value=gismu[e+'.gismu'];
  var xref = gismu[ e+'.xref' ];
  var html='<div class="label_title">Related:</div>';
  var xref_subs=xref.split(" ");
  for (s in xref_subs) {
    var gs=xref_subs[s]; console.log(gs); console.log(gismu);
    if (gismu.hasOwnProperty(gs+'.gismu')) {
      console.log('found match');
      html += '<a onclick="current_i='
              +gismu[gs+'.entry_num']
              +';updateGismu();return false;">'
              + gs + '</a>'
              + ' (' + gismu[gs+'.gloss'] + ')<br> ';
    } else {
      console.log(gs+' was not a match');
//      html += gs + ' ';
    }
  }
  console.log(html);
  document.getElementById('xref_label').innerHTML=html;
}

function prevGismu() {
  current_i--;
  if (current_i<0) { current_i=entries.length-1; }
  updateGismu();
}

function nextGismu() {
  current_i++;
  current_i=current_i % entries.length;
  updateGismu();
}

function filterGismu() {
  var filter=$("#filter_input").val();
  var entry_list = [];
  for (e in entries) {
      if (entries[e].match(filter)) { entry_list.push(entries[e]); }
  }
  // temp to look at result
  $("#filter_list").text(entry_list.join(", "));
}
