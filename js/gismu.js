

$(document).ready(function(){

    $("#Card,#Rafsi,#Filter,#Quiz").hide();
    $("#Card").show();

    $("#Card_menu").click(function(e) {
	e.preventDefault();
	
	$("#menu ul li a").each(function() {
	    $(this).removeClass("active");	
	});
	
	$(this).addClass("active");
	
	$("#Card,#Rafsi,#Filter,#Quiz").hide();
	$("#Card").show();
    });
    $("#Rafsi_menu").click(function(e) {
	e.preventDefault();
	
	$("#menu ul li a").each(function() {
	    $(this).removeClass("active");	
	});
	
	$(this).addClass("active");
	
	$("#Card,#Rafsi,#Filter,#Quiz").hide();
	$("#Rafsi").show();
    });
    $("#Filter_menu").click(function(e) {
	e.preventDefault();
	
	$("#menu ul li a").each(function() {
	    $(this).removeClass("active");	
	});
	
	$(this).addClass("active");
	
	$("#Card,#Rafsi,#Filter,#Quiz").hide();
	$("#Filter").show();
    });
    $("#Quiz_menu").click(function(e) {
	e.preventDefault();
	
	$("#menu ul li a").each(function() {
	    $(this).removeClass("active");	
	});
	
	$(this).addClass("active");
	
	$("#Card,#Rafsi,#Filter,#Quiz").hide();
	$("#Quiz").show();
    });

    setColumns();

    $(window).resize(function() { setColumns(); });

    $("input[name=rfinterp]:radio").click(function() {	    
	if ($("input[name=rfinterp]:radio:checked").val().match('bag')) {
	    $("input[name=f_tie_begin]:checkbox").removeAttr('checked');
	    $("input[name=f_tie_end]:checkbox"  ).removeAttr('checked');
	}
    });

    $("#Card").swipe( {
	swipeLeft:function() { nextGismu() },
	swipeRight:function() { prevGismu() },
	allowPageScroll:"auto",
	triggerOnTouchEnd:false,
	triggerOnTouchLeave:true,
	threshold:20
    });
});

function setColumns() {
    var ncol=Math.floor($(document).width()/250);
    $("#list_label").css("column-count",ncol);
    $("#xref_label").css("column-count",ncol);
}

function showCard() {
    $("#Card_menu").addClass("active");
    $("#Filter_menu").removeClass("active");
    $("#Filter").hide();
    $("#Card").show();
}

var gismu=[ ];
var entries=[ ];

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
  document.getElementById('def_label'  ).innerHTML='<div class="label_title">Full Def:</div>'     +gismu[e+'.full_def'];
  document.getElementById('notes_label').innerHTML='<div class="label_title">Notes:</div>'        +gismu[e+'.notes'];

  document.getElementById('gismu_label').value=gismu[e+'.gismu'];
  var xref = gismu[ e+'.xref' ];
  var html='<div class="label_title">Related:</div>';
    console.log(gismu); console.log(xref);
  if (xref.length>0) {
      var xref_subs=xref.split(" ");
      for (s in xref_subs) {
	  var gs=xref_subs[s]; console.log(gs); console.log(gismu);
	  if (gismu.hasOwnProperty(gs+'.gismu')) {
	      console.log('found match');
	      html += '<b class="gismu_list_gismu"><a onclick="current_i='
		  +gismu[gs+'.entry_num']
		  +';updateGismu();return false;">'
		  + gs + '</a></b>'
		  + ' - ' + gismu[gs+'.gloss'] + '<br> ';
	  } else {
	      console.log(gs+' was not a match');
	      //      html += gs + ' ';
	  }
      }
  }
  console.log(html);
  document.getElementById('xref_label').innerHTML=html;
}

var gismuTimer;
var timerSet=0;

function playGismu() {
    if (timerSet==0) {
	gismuTimer=setInterval("nextGismu()",600);
	timerSet=1;
    }
}

function stopGismu() {
    if (timerSet==1) {
	clearInterval(gismuTimer);
	timerSet=0;
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

  var filter;
  switch (filter_option) {
      case "one":
        filter='['+letters.join('')+']';
        break;
      case "bag":
        letters.sort();
        filter='(?=.*'+letters.join(')(?=.*')+')';
        filter=filter.replace(/(\w).*?\1/,"$1.*$1");
        break;
      case "list":
        filter=letters.join(".*");
        break;
      case "cluster":
        filter=letters.join("");
        break;
      default:
        filter=filter_entry;
  }   
  if ($("input:checkbox[name='f_tie_begin']:checked").val()) { filter='^'+filter; }
  if ($("input:checkbox[name='f_tie_end']:checked"  ).val()) { filter=filter+'$'; }
  return filter;
}

function filterGismu() {

  var filter=filterRegex();
// alert(filter);
  var entry_list = [];
  var gi_list = [];
  for (e in entries) {
      if (entries[e].match(filter)) { 
	  entry_list.push(entries[e]); 
	  gi_list.push(e);
      }
  }
  // temp to look at result
  var html='<div class="label_title">'+entry_list.length+' matches found:</div>';

  for (e in entry_list) {
      html += '<b class="gismu_list_gismu"><a onclick="current_i='
              + gismu[entry_list[e]+'.entry_num']
              +';updateGismu();showCard();return false;">'
              + entry_list[e] + '</a></b>'
              + ' - ' + gismu[entry_list[e]+'.gloss'] + '<br> ';
  }
  $("#filter_list").html(html);
}
