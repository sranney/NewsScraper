$("#hn_scrape").on("click",function(){
	$.ajax({
		url:"/scrape_hn",
		method:"get"
	}).done(function(result){
		if(result.numArticles===0){
			Materialize.toast('<img width=\'70\' src=\'images/ycombinator.png\' class=\'left\'> no new articles to add', 4000);
		} else {
			Materialize.toast('<img width=\'70\' src=\'images/ycombinator.png\' class=\'left\'><br> '+result.numArticles+' new articles have been scraped!', 4000);
		}
	});
});
$("#tc_scrape").on("click",function(){
	$.ajax({
		url:"/scrape_tc",
		method:"get"
	}).done(function(result){
		if(result.numArticles===0){
			Materialize.toast('<img width=\'70\' src=\'images/techcrunch.jpg\' class=\'left\'> no new articles to add', 4000);
		} else {
			Materialize.toast('<img width=\'70\' src=\'images/techcrunch.jpg\' class=\'left\'><br> '+result.numArticles+' new articles have been scraped!', 4000);
		}
	});
})
