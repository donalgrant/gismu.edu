

var gismu=[ ];
var entries=[ ];
var rafsi=[ ];

var current_i;
var quiz_list=[ ];
var qi_current=0;

var articles=[ 'Card', 'Rafsi', 'Filter', 'Quiz', 'Glico' ];
function hideArticles() { for (i in articles) { $("#"+articles[i]).hide(); } }

$(document).ready(function(){

    var createMenuClick = function(article) {
	return function(e) {
	    var menu=article+'_menu';
	    e.preventDefault();
	    $("#menu ul li a").each(function() {
		$(this).removeClass("active"); 
	    });
	    $(menu).addClass("active"); 
	    hideArticles();
	    $(article).show(); 
	};
    };

    for (i in articles) { 
	var art ='#'+articles[i];
	var art_menu='#'+articles[i]+'_menu';
	$(art_menu).click(createMenuClick(art));
    }

    setColumns();

    $(window).resize(function() { setColumns(); });

/*
    $("input[name=rfinterp]:radio").click(function() {	    
	if ($("input[name=rfinterp]:radio:checked").val().match('bag')) {
	    $("input[name=f_tie_begin]:checkbox").removeAttr('checked');
	    $("input[name=f_tie_end]:checkbox"  ).removeAttr('checked');
	}
    });
*/

    $("#Card").swipe( {
	swipeLeft:function() { nextGismu() },
	swipeRight:function() { prevGismu() },
	allowPageScroll:"auto",
	triggerOnTouchEnd:false,
	triggerOnTouchLeave:true,
	threshold:20
    });

    $("#Card_menu").click();

    initGismu();
    selectGismu();
    current_i=0;
    updateGismu();
    quiz_list=entries;
    quizUpdate();

});

// select the gismu data to be used, and
// initialize the entries
function selectGismu() {
    entries=[];
    for (var p in gismu) {
	if (p.match(/[.]gismu/)) { 
	    if (gismu[p].match(/^.{5}$/)) {
		entries.push(gismu[p]); 
	    }
	}
    }
    entries.sort();  
    // now assign cross-references
    for (e in entries) {
	gismu[entries[e]+'.entry_num']=e;
	var r=gismu[entries[e]+'.rafsi'];
	var ra=r.split(/\s+/);
	for (ir in ra) { rafsi[ra[ir]]=entries[e]; }
    }
}

function setColumns() {
    var ncol=Math.floor($(document).width()/250);
    $("#list_label").css("column-count",ncol);
    $("#xref_label").css("column-count",ncol);

    ncol=Math.floor($(document).width()/400);
    $("#glico_label").css("column-count",ncol);
}

function showCard() { $("#Card_menu").click(); }

function newGismu() {
  var gr=$("#gismu_label").val(); 
  for (e in entries) {
    if (entries[e].match(gr)) {  // better way than stepping through them -- search gismu, then use gismu.entry_num?
      current_i=e;
      updateGismu();
      return;
    }
  }
}

function randomGismu() {
    current_i=Math.floor(Math.random()*entries.length);
    updateGismu();
}

function updateGismu() {

  var e = entries[current_i];

  $('#rafsi_label').html('<div class="label_title">rafsi:</div>'        +gismu[e+'.rafsi']   );
  $('#gloss_label').html('<div class="label_title">English Gloss:</div>'+gismu[e+'.gloss']   );
  $('#def_label'  ).html('<div class="label_title">Full Def:</div>'     +gismu[e+'.full_def']);
  $('#notes_label').html('<div class="label_title">Notes:</div>'        +gismu[e+'.notes']   );

  $('#gismu_label').val(gismu[e+'.gismu']);

  var xref = gismu[ e+'.xref' ];
  var html='<div class="label_title">Related:</div>';

  if (xref.length>0) {
      var xref_subs=xref.split(" ");
      for (s in xref_subs) {
	  var gs=xref_subs[s];
	  if (gismu.hasOwnProperty(gs+'.gismu')) { html+=filterOutputItem(gs); }
      }
  }
  $('#xref_label').html(html);
}

var gismuTimer;
var timerSet=0;
var gismuInterval=1000;

function playGismu() {
    if (timerSet==0) {
	gismuTimer=setInterval("nextGismu()",1000);
	timerSet=1;
    } else {
	clearInterval(gismuTimer);
	gismuInterval/=2;
	gismuTimer=setInterval("nextGismu()",gismuInterval);
    }
}

function stopGismu() {
    if (timerSet==1) {
	clearInterval(gismuTimer);
	timerSet=0;
	gismuInterval=1000;
    }
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

function filterRegex() {

  var filter_option=$("input:radio[name='rfinterp']:checked").val();
  var filter_entry=$("#filter_input").val().toLowerCase();
  var letters=filter_entry.replace(/[^abcdefgijklmnoprstuvxz']/g,"").split('');  // delete all non-gismu content
  var match_begin=$("input:checkbox[name='f_tie_begin']:checked").val();
  var match_end  =$("input:checkbox[name='f_tie_end']:checked"  ).val();
  var filter;
  switch (filter_option) {
      case "one":
        filter='['+letters.join('')+']';
        if (match_begin && match_end) {
	    filter='^'+filter+'.*'+filter+'$';
	} else {
            if (match_begin) { filter = '^'+filter; }
            if (match_end  ) { filter +='$'; }
	}
        break;
      case "bag":
        letters.sort();
        filter='(?=.*'+letters.join(')(?=.*')+')';
        filter=filter.replace(/(\w).*?\1/,"$1.*$1");
        if (match_begin) { filter='^(?='+letters.join('|')+')'+filter; }
        if (match_end  ) { filter+='.*('+letters.join('|')+')$'; }
        break;
      case "list":
        filter=letters.join(".*");
        if (match_begin) { filter='^'+filter; }
        if (match_end  ) { filter+='$'; }
        break;
      case "cluster":
        filter=letters.join("");
        if (match_begin) { filter='^'+filter; }
        if (match_end  ) { filter+='$'; }
        break;
      default:
        filter=filter_entry;
        if (match_begin) { filter='^'+filter; }
        if (match_end  ) { filter+='$'; }
  }   
  return filter;
}

quizUpdate();

function filterOutputItem(item,use_def) {
    var entry=gismu[item+'.entry_num'];
    var gloss=gismu[item+'.gloss'];
    var rafsi=gismu[item+'.rafsi'];
    var def  =gismu[item+'.full_def'];
    if (rafsi.length==0) { rafsi='(none)'; }
    var html='<div class="filter_output_item">';
    html+='<span class="gismu_list_gismu">'
	+'<a onclick="current_i=' + entry +';updateGismu();showCard();return false;">'
        + item + '</a></span>' + '<div class="gloss_list_item">' + gloss + '</div> ';
    if (use_def) {
	html+='<div class="gismu_list_rafsi">rafsi:  '+rafsi+'</div>';
	html+='<div class="gismu_list_def">'+def+'</div>';
    }
    html+='</div>';
    return html;
}

function filterGismu() {

  var filter=filterRegex();

  quiz_list = [];
  var qi_list = [];
  for (e in entries) {
      if (entries[e].match(filter)) { 
	  quiz_list.push(entries[e]); 
	  qi_list.push(e);
      }
  }
  // temp to look at result
  var html='<div class="label_title">'+quiz_list.length+' matches found:</div>';

  for (e in quiz_list) { html += filterOutputItem(quiz_list[e]); }

  $("#filter_list").html(html);
  quizUpdate();
}

function quizUpdate() {
    qi_current=Math.floor(Math.random()*quiz_list.length);
    $("#quiz_text").html(gismu[quiz_list[qi_current]+'.full_def']);
    $("#quiz_input").val('');
}

function quizCheck() {
    var gismu_input=$("#quiz_input").val().toLowerCase();
    if (gismu_input.match(quiz_list[qi_current])) { $("#quiz_result_text").html("Correct!!"); }
    else                                            { $("#quiz_result_text").html("Wrong.  Answer is "+quiz_list[qi_current]); }
    quizUpdate();
}

function glicoFacki() {

    var match_entry=$("#glico_input").val().toLowerCase();
    var gl_list = [];
    for (var e in entries) {
	var full_def=gismu[entries[e]+'.full_def'];
	var gloss   =gismu[entries[e]+'.gloss'];
	if (full_def.match(match_entry))   { gl_list.push(entries[e]); }
	else if (gloss.match(match_entry)) { gl_list.push(entries[e]); }
    }

    var html='<div class="label_title">'+gl_list.length+' matches found:</div>';
    
    for (var e in gl_list) { html+=filterOutputItem(gl_list[e],1); }

    $("#glico_list").html(html);
}

function rafsiCard() {

    var rafsi_entry=$("#rafsi_input").val().toLowerCase();
    var gismu_keys = [ ];
    var count=0;
    for (var key in rafsi) {
	if (key.match(rafsi_entry)) { 
	    gismu_keys[rafsi[key]]=1;
	    count++;
	}
    }

    var html='<div class="label_title">'+count+' matches found:</div>';
    
    for (e in gismu_keys) { html += filterOutputItem(e,1); }
    
    $("#rafsi_list").html(html);

}
