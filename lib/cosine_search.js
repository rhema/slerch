 
 
    var punct='\\['+ '\\!'+ '\\"'+ '\\#'+ '\\$'+   // since javascript does not
          '\\%'+ '\\&'+ '\\\''+ '\\('+ '\\)'+  // support POSIX character
          '\\*'+ '\\+'+ '\\,'+ '\\\\'+ '\\-'+  // classes, we'll need our
          '\\.'+ '\\/'+ '\\:'+ '\\;'+ '\\<'+   // own version of [:punct:]
          '\\='+ '\\>'+ '\\?'+ '\\@'+ '\\['+
          '\\]'+ '\\^'+ '\\_'+ '\\`'+ '\\{'+
          '\\|'+ '\\}'+ '\\~'+ '\\]';

    var re=new RegExp(     // tokenizer
       '\\s*'+            // discard possible leading whitespace
       '('+               // start capture group
         '\\.{3}'+            // ellipsis (must appear before punct)
       '|'+               // alternator
         '\\w+\\-\\w+'+       // hyphenated words (must appear before punct)
       '|'+               // alternator
         '\\w+\'(?:\\w+)?'+   // compound words (must appear before punct)
       '|'+               // alternator
         '\\w+'+              // other words
       '|'+               // alternator
         '['+punct+']'+        // punct
       ')'                // end capture group
     );


function grep(ary,filt) {
  var result=[];
  for(var i=0,len=ary.length;i++<len;) {
    var member=ary[i]||'';
    if(filt && (typeof filt === 'Function') ? filt(member) : member) {
      result.push(member);
    }
  }
  return result;
}

function tokenize(ugly_string)
{
	var words = grep( ugly_string.toLowerCase().split(re) );
	return words;
}


function show_all_included_words()
{
//  var words = //$("#words").val().toLowerCase().split(/\W+/);
  var words = grep( $("#words").val().toLowerCase().split(re) );

  //console.log("1");
  //console.log(words);
  
  var output = "";
  for(var i in words)
  {
     if(!(words[i].match("^[a-z]+$")))
        continue;//skip empty
     var the_idf = Math.log(total_words/(term_dictionary["the"]));
     var idf = Math.log(total_words/(term_dictionary[words[i]]));
     idf -= the_idf;
     
     //console.log(idf);
     idf = idf;
     if(words[i] in term_dictionary)
     {
        //console.log("output:"+words[i]+" idf "+idf)
         output += " <font size='"+idf+"'>"+words[i]+"</font>";//1
     }
  }
    //console.log("2");
  $("#outspot").html(output);
    //console.log("3");

}

var dictionary_has_loaded = 0;
var try_load = 0;
function loadDictionary()
{
  if(try_load != 0)
      return;
  try_load = 1;
  $.ajaxSetup({
    cache: true
  });
  $.getScript("/lib/dictionary.js", function(data, textStatus, jqxhr) {
   $("#header_text").html("Dictionary is loaded. Type or paste text");
   dictionary_has_loaded = 1;
   show_all_included_words();
  });
}

var wiki_text = ["The use of barter-like methods may date back to at least 100,000 years ago, though there is no evidence of a society or economy that relied primarily on barter.[9] Instead, non-monetary societies operated largely along the principles of gift economics and debt.[10][11] When barter did in fact occur, it was usually between either complete strangers or potential enemies.[12]", "In the past, money was generally considered to have the following four main functions, which are summed up in a rhyme found in older economics textbooks: \"Money is a matter of functions four, a medium, a measure, a standard, a store.\" That is, money functions as a medium of exchange, a unit of account, a standard of deferred payment, and a store of value.[5] However, modern textbooks now list only three functions, that of medium of exchange, unit of account, and store of value, not considering a standard of deferred payment as a distinguished function, but rather subsuming it in the others.[4][20][21]", "In economics, money is a broad term that refers to any financial instrument that can fulfill the functions of money (detailed above). These financial instruments together are collectively referred to as the money supply of an economy. In other words, the money supply is the amount of financial instruments within a specific economy available for purchasing goods or services. Since the money supply consists of various financial instruments (usually currency, demand deposits and various other types of deposits), the amount of money in an economy is measured by adding together these financial instruments creating a monetary aggregate.", "Currently, most modern monetary systems are based on fiat money. However, for most of history, almost all money was commodity money, such as gold and silver coins. As economies developed, commodity money was eventually replaced by representative money, such as the gold standard, as traders found the physical transportation of gold and silver burdensome. Fiat currencies gradually took over in the last hundred years, especially since the breakup of the Bretton Woods system in the early 1970s.", "When gold and silver are used as money, the money supply can grow only if the supply of these metals is increased by mining. This rate of increase will accelerate during periods of gold rushes and discoveries, such as when Columbus discovered the New World and brought back gold and silver to Spain, or when gold was discovered in California in 1848. This causes inflation, as the value of gold goes down. However, if the rate of gold mining cannot keep up with the growth of the economy, gold becomes relatively more valuable, and prices (denominated in gold) will drop, causing deflation. Deflation was the more typical situation for over a century when gold and paper money backed by gold were used as money in the 18th and 19th centuries."];

function cos_search_setup()
{
	loadDictionary();
}

function set_of_strings_to_dict_counts(set)
{
	var ret = [];
	for(var i in set)
	{
		var words = tokenize(set[i]);
		var dict = [];
		for(var k in words)
		{
			if((words[i] in term_dictionary) == false)//skip if not in dictionary
			    continue;
			var word = words[k];
			if(word in dict)
				dict[word] += 1;
			else
				dict[word] = 1;
		} 
		ret.push(dict);
	}
	return ret;
}

function score_query(query, bag_o_words){
	var search_words = tokenize(query);
	var score = 0;
	for(var sw in search_words)
	{
		var word = search_words[sw];
		if(word in bag_o_words)
		{
			console.log("found word "+word + " in term dict:"+term_dictionary[word]+" in bagowords:"+bag_o_words[words]);
			score += bag_o_words[word]*Math.log(term_dictionary[word]);
		}
	}
	return score;
}

function get_scores(query,set)//ug.... not sure how to normalize yet....
{
	var dict_set = set_of_strings_to_dict_counts(set);
	var ret = [];
	for(var i in set)
	{
		var score = score_query(query,dict_set[i]);
		ret.push(score);
	}
	return ret;
}

function make_word_box() {
  loadDictionary();
  $("#words").keyup( function(event) {
	  if(dictionary_has_loaded)
	  {
	    show_all_included_words();
	  }
	  //console.log("typed");
	 });
}