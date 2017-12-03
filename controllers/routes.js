var request = require("request");
var cheerio = require("cheerio");
var moment = require("moment");

module.exports = function(app,HN,TC,Note){
///////////////////////////HOME FUNCTIONS
	app.get("/",function(req,res){
		res.render("Home",{source:"home",home:true});
	})
//////////////////////////SCRAPER FUNCTIONS - DIRECTING TO THE RIGHT SOURCE FUNCTION
	app.get("/scrape_:source",function(req,res){
		req.params.source=="hn"? hnscraper(res) : req.params.source=="tc"? tcscraper(res) : wrong(res);
	})
/////////////////////////HACKER NEWS SCRAPER
	function hnscraper(res){
	var newsArr_ycomb = [];
		request('https://news.ycombinator.com/newest', function (error, response, html) {
		  if (!error && response.statusCode == 200) {//making sure that html was actually returned
		    var $ = cheerio.load(html);//load cheerio parser

		    $("a.storylink").each(function(i,element){//i=index; element=dom elements with selector a.storylink
		    	newsArr_ycomb.push({});
		    	var storyLine = $(this).text();
		    	var storyLine_href = $(this).attr("href");
		    	storyLine_href = storyLine_href.substr(0,4)=="item"? "https://news.ycombinator.com/"+storyLine_href : storyLine_href;
		    	newsArr_ycomb[i].storyline = storyLine;
		    	newsArr_ycomb[i].storyline_href = storyLine_href;
		    });
		    $("span.sitestr").each(function(i,element){
		    	var site = $(this).text();
		    	newsArr_ycomb[i].site = site;
		    });
		    $("span.score").each(function(i,element){
		    	var score = $(this).text();
		    	newsArr_ycomb[i].score = score;
		    });
		    $("a.hnuser").each(function(i,element){
		    	var user = $(this).text();
		    	newsArr_ycomb[i].user = user;
		    });
		    $("span.age>a").each(function(i,element){
		    	var age = $(this).text();
		    	if(age.indexOf("minute")>-1){
		    		var calculatedDate = parseInt(age.substr(0,age.indexOf("minutes")-1));
		    		calculatedDate = moment().subtract(calculatedDate, 'minutes');
		    	} else if(age.indexOf("hour")>-1){
		    		var calculatedDate = parseInt(age.substr(0,age.indexOf("hour")-1));
		    		calculatedDate = moment().subtract(calculatedDate, 'hours');
		    	} else if(age.indexOf("day")>-1){
		    		var calculatedDate = parseInt(age.substr(0,age.indexOf("day")-1));
		    		calculatedDate = moment().subtract(calculatedDate, 'days');
		    	}
		    	newsArr_ycomb[i].date = calculatedDate;
		    });
		    $("td.subtext > a:nth-child(6)").each(function(i,element){
		    	var numComments = $(this).text();
		    	newsArr_ycomb[i].numComments = numComments;
		    	newsArr_ycomb[i].notes = [];
		    });

			HN.find({},{storyline_href:1,_id:0}).then(function(allinDB_HN){	    
				var allhrefs = allinDB_HN.map((item)=>{
					return item.storyline_href;
				});
				var scrapedhrefs = newsArr_ycomb.map((item)=>{
					return item.storyline_href;
				});
				var dataToPush = newsArr_ycomb.filter((item,indx)=>{
					return allhrefs.indexOf(scrapedhrefs[indx])==-1;
				});
				HN.insertMany(dataToPush,{ordered:false})
			  	.then(function(dbNews) {
			  		res.json({numArticles: dbNews.length});
			  	})
			  	.catch(function(err) {
			  		console.log(err);
			  		res.json({
			  			numArticles: dbNews.length
			  		});
			  	});
			});
		  }
		});
	}
//////////////////////////////TECH CRUNCH SCRAPER
	function tcscraper(res){
		var newsArr_tcrunch = [];
		request('https://techcrunch.com/', function (error, response, html) {
		  if (!error && response.statusCode == 200) {//making sure that html was actually returned
		    var $ = cheerio.load(html);//load cheerio parser
		    var storyIDs = [];
			$("#river1>li").each(function(i,element){
				var id=$(this).attr("id");
				storyIDs.push(id);
			})
			$("#river2>li").each(function(i,element){
				var id=$(this).attr("id");
				storyIDs.push(id);		
			})
		  	storyIDs.forEach((id,indx)=>{
		  		newsArr_tcrunch.push({});
		  		newsArr_tcrunch[indx].category = $("#"+id+" > div > div.tags > a > span").text();
		  		newsArr_tcrunch[indx].headline = $("#"+id+" > div > div.block-content > h2").text();
		  		newsArr_tcrunch[indx].story_href = $("#"+id+" > div > div.block-content > h2 > a").attr("href");
		  	    newsArr_tcrunch[indx].date = $("#"+id+" > div > div.block-content > div.byline > time").attr("datetime");
		  	    newsArr_tcrunch[indx].age = $("#"+id+" > div > div.block-content > div.byline > time").text().trim();
		  	    newsArr_tcrunch[indx].author = $("#"+id+" > div > div.block-content > div.byline > a").text();
		  	    var excerpt = $("#"+id+" > div > div.block-content > p").text();
		  	    excerpt = excerpt.replace("… Read More","");
		  	    newsArr_tcrunch[indx].excerpt = excerpt;
		  	    newsArr_tcrunch[indx].notes = [];
		  	});
		  	TC.find({},{story_href:1,_id:0}).then(function(allinDB_TC){	    
				var allhrefs = allinDB_TC.map((item)=>{
					return item.story_href;
				});
				var scrapedhrefs = newsArr_tcrunch.map((item)=>{
					return item.story_href;
				});
				var dataToPush = newsArr_tcrunch.filter((item,indx)=>{
					return allhrefs.indexOf(scrapedhrefs[indx])==-1;
				});
			  	TC.insertMany(dataToPush,{ordered:false})
			  		.then(function(dbNews) {
			    		res.json({numArticles: dbNews.length});
			  		})
			  	.catch(function(err) {
			  		res.json({
			  			numArticles: dbNews.length
			  		}); 
			  	});
			});
		  }
		});
	}
//////////////////////////////INVALID SOURCE
	function wrong(res){
		res.render("Home");
	}
/////////////////////////////READING ARTICLES
	app.get("/:source",function(req,res){
		var source = req.params.source;

		source == "hn" ? hnarticles(res) : source == "tc" ? tcarticles(res) : wrong(res);

	})
///////////////////////////////GET HACKER NEWS ARTICLES
	function hnarticles(res){
		HN
		.find({})
		.sort( { date: -1 } )
		.populate("notes")
    	.exec(function(err,dbArticlewithNotes){
			res.render("HackerNews",{results:dbArticlewithNotes,pic:"ycombinator.png",notHome:true,source:"hn"});
		});
	}
///////////////////////////////GET TECH CRUNCH ARTICLES
	function tcarticles(res){
		TC		
		.find({})
		.sort( { date: -1 } )
		.populate("notes")
    	.exec(function(err,dbArticlewithNotes){
			res.render("TechCrunch",{results:dbArticlewithNotes,pic:"techcrunch.jpg",notHome:true,source:"tc"});
		});
	}
////////////////////////////////CREATE COMMENT FOR SPECIFIC ARTICLE
	app.post("/:source/:article_ref/createComment",function(req,res){
		console.log("here");
		var source = req.params.source;
		console.log(source);
		var model = source==="hn"? HN : source==="tc" ? TC : wrong(res);
		var redirect = source==="hn"? "/hn" : source ==="tc" ? "/tc" : wrong(res);
		console.log(model);
		var article_ref = req.params.article_ref;
		console.log(article_ref);
		model.findOne({_id:article_ref}).then(function(result){
			if(result){
				Note
				.create(req.body)
				.then(function(dbNote) {
				  return model.findOneAndUpdate({"_id":article_ref}, { $push: { notes: dbNote._id } }, { new: true });
				})
				.then(function(dbArticle) {
					res.redirect(redirect);
				})
				.catch(function(err) {
				  console.log(err);
				});
			} else {
				res.redirect(redirect);
			}
		})
	});	
}