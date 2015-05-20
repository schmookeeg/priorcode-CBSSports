Object.size = function (obj)
{
    var size = 0, key;
    for (key in obj)
    {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};



var objLength = function(obj){    
    var key,len=0;
    for(key in obj){
        len += Number( obj.hasOwnProperty(key) );
    }
    return len;
};

//Remember Me Local Storage Functions
///////////////////
createLocalStorage = function(name,value) {
    localStorage[name] = value;
}

readLocalStorage = function(name) {
    var tempLocalStorage = localStorage[name];
    if(tempLocalStorage)
    {
        return tempLocalStorage;
    }
    else
    {
        return null;
    }
}

eraseLocalStorage = function(name) {
    delete localStorage[name];
}
//Remember Me Local Storage Functions
///////////////////


moveZoomedInScrollView = function(location){
	
	try{
		//console.log("clearing timeout");
	 	clearTimeout(scrollviewPositionChangeDelay);	
	}catch(e){
		console.log("error clearing timeout: "+e);
	}
	
	location = location.toLowerCase();
	
	var newZoomedInXpos = 0;
	var newZoomedInYpos = 0;
		
	//if location is set to right adjust the scroll view to be right justified at load 
	if (location == "right") {
		//take width of viewport and subtract scrollview content width to determine the negative x position
		newZoomedInXpos = $(window).width() - 860;
		newZoomedInYpos = 0;
	}
	
	$('#bracketZoomedPage #content.ui-scrollview-clip').scrollview('scrollTo',newZoomedInXpos,newZoomedInYpos);
	scrollviewPositionChangeDelay = setTimeout(function(){  
		$('#bracketZoomedPage #content.ui-scrollview-clip').scrollview('scrollTo',newZoomedInXpos,newZoomedInYpos);
	}, 1000);

	//console.log("setting scrollTo x to:"+newZoomedInXpos+"  and y to:"+newZoomedInYpos);
}

if (!window.console) {var console = {};}
if (!console.log) {console.log = function() {};}

if (!Function.prototype.bind)
{
    Function.prototype.bind = function (oThis)
    {
        if (typeof this !== "function")
        {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () { },
        fBound = function ()
        {
            return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis || window,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
// Partner ID provided by CBSSports
var PID = "cbcf439c17c5d0ffe78a82e2645a9e0f";
var PROXY = ""
var PROXY2 = ""
var API = {
    base: "cbssports.com",
    login: "xml/fantasy/login",
    getTeams: "xml/fantasy/get-teams",
    getPicks: "xml/brackets/get-picks",
    setPicks: "xml/brackets/set-picks",
    getUsers: "xml/brackets/get-users", 
    getRules: "xml/brackets/get-rules",
    getInfo: "xml/brackets/info",
    leagueInfo: "xml/league",
    standings: "print/xml/opm/standings"
	// Bracket Challenge - http://freebracketchallenge.1.mayhem.cbssports.com/print/xml/brackets/standings
};

var challengeStandingsURL = ".mayhem.cbssports.com/print/xml/brackets/standings";
var matchupAnalysisURL = "http://www.cbssports.com/partners/feeds/trailerpark/mmedge";
var challengeRulesURL = "http://freebracketchallenge.1.mayhem.cbssports.com/xml/brackets/get-rules?partner_id=cbcf439c17c5d0ffe78a82e2645a9e0f";   

var MODE_DEV = true; //Leave this true, since we are deploying to TP Sever now

if (MODE_DEV) {
	PROXY = "proxy.php?url=";
	PROXY2 = "proxy2.php?url=";	
}

var USE_FAKE_FEEDS = false;

if (USE_FAKE_FEEDS) {
	challengeStandingsURL = ".mayhem.cbssports.com/xml/brackets/fake-challenge-standings";
	matchupAnalysisURL = "http://www.cbssports.com/partners/feeds/sample/mmedge?debug=31";
}


if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
    $("a .bracketTeamTitle, a.mybracket-single")
    .live("touchstart", function () {
        $(this).addClass("fake-active");
    })
   .live("touchend", function() {
        $(this).removeClass("fake-active");
    })
    .live("touchcancel", function() {
        // sometimes Android fires a touchcancel event rather than a touchend. Handle this too.
        $(this).removeClass("fake-active");
    });
}


 
var mayhem = function () { this._init(); };

mayhem.prototype = {

	
    _init: function ()
    {
		$.mobile.loadingMessage = "Loading..."
        this.setListeners();
		
		this.activeLeague = null;
		this.activeRegion = null;
		$("html").addClass( "ui-loading" );
    },
    activeLeague:"",
	pickerPopupHandle:{},
	clearPicksFlag:null,
    gameIsOn:true,			// POST TOURNEY START: SET TO SOME VALUE. WILL BE "FALSY" AS NULL

    setListeners: function ()
    {
        var self = this;

		$.mobile.showPageLoadingMsg();
		/*
        if (!self.isLoggedIn() && location.hash != '#login'  && this.goToPage!='#login')
        {
			console.log("to Login");
			this.goToPage='#login';
			$('.ui-page[data-url="brackets"]').empty().removeClass('.ui-page-active');
			$.mobile.changePage('#login', { transition: 'none' });
        } else if (self.isLoggedIn() && location.hash == '#login'  && this.goToPage!='#brackets'){
			this.goToPage='#brackets';
			$.mobile.changePage('#brackets', { transition: 'none' });
        }
		*/
		//alert("isLoggedIn: " + self.isLoggedIn());
		
        if (self.isLoggedIn() && location.hash != '#bracket')
        {
			console.log("to Brackets");
            $.mobile.changePage('#brackets', { transition: 'none'});
        } else 
        {
			console.log("to Login");
			
			$.mobile.changePage('#login', { transition: 'none' });
			
			$("#username").val(readLocalStorage("rememberMeLS"));
			if(readLocalStorage("rememberMeLS") != null){
				$('#checkremember').prop("checked", true);
			}
			setTimeout(function(){

				try{
					addToHome.show();
				}catch(e){
					console.log("Failed to show add2home");
				}

				setTimeout(function(){

					try{
						addToHome.close();
					}catch(e){
					console.log("Failed to close add2home");
				}

				}, 9000)
			}, 3000);
			
        }


        $("#login-form").submit(this.logIn.bind(this));
        //$('#getTeams').click(this.getTeams.bind(this));
		
	

		
		
        $(document).bind("pagebeforechange", this.getPageData.bind(this));
		
        $(document).bind("pagechange", this.afterPageData.bind(this));

        $('.ui-page-active .ui-scrollview-view').live('touchmove', function (e)
        {
            if ($('.ui-page-active .ui-scrollview-view').height() == $('.ui-page-active .content').height())
            {
                e.preventDefault();
                return false;
            }
        });
        $('.ui-page-active .ui-scrollview-view').live('mousemove', function ()
        {
            if ($('.ui-page-active .ui-scrollview-view').height() == $('.ui-page-active .content').height()) return false;
        });

        $('#header .overlay').live('tap', function(){menuToggle()});



		/*$('#mybracket').live('click',function(){
			var l = $(this).attr('data-league');
			self.goToPage=null;
			$.mobile.changePage('#bracket_overview?league='+l);
			return false;
		});
		$('#mybracket').live('tap',function(){
			var l = $(this).attr('data-league');
			self.goToPage=null;
			$.mobile.changePage('#bracket_overview?league='+l);
			return false;
		});*/
	
		$("#menu_standings a").live('click', function(){
			menuToggle();
			//console.log("my location = "+location.hash);
			if(location.hash != '#standings'){
				//console.log(self.goToPage);
				self.goToPage = null;
				var l = '#standings?league='+self.activeLeague;
				//console.log(l)
				$.mobile.changePage(l);
				
			}
			else
			{
				//console.log("refresh");
				location.reload();
			}
			
			return false;
		});
		$("#menu_home a").live('click', function(){
			menuToggle();
			//console.log("my location = "+location.hash);
			if(location.hash != '#brackets'){
				//console.log(self.goToPage);
				self.goToPage = null;
				var l = '#brackets';
				//console.log(l)
				$.mobile.changePage(l);
			}
			return false;
		});
		$("#menu_bracket a").live('click', function(){
			menuToggle();
			//console.log("my location = "+location.hash);
				if(location.hash != '#bracket_overview'){
				self.goToPage = null;
				var l = '#bracket_overview?league='+self.activeLeague;
				$.mobile.changePage(l);
			}
			return false;
		});
	
		$("#menu_rules a").live('click', function(){
			menuToggle();
			//console.log("my location = "+location.hash);
			if(location.hash != '#rules'){
				//console.log(self.goToPage);
				self.goToPage = null;
				var l = '#rules?league='+self.activeLeague;
				//console.log(l)
				$.mobile.changePage(l);
			}
			return false;
		})

        $('#tapabbleArea div').click(function ()
        {
		if($(this).attr('class') == "Tiebreaker") return;
		// did you make all of your picks?
				if((cbs.picksInfoObject["east"] && cbs.picksInfoObject["east"][4] && cbs.picksInfoObject["east"][4][1] && cbs.picksInfoObject["west"] && cbs.picksInfoObject["west"][4] && cbs.picksInfoObject["west"][4][1] && cbs.picksInfoObject["midwest"] && cbs.picksInfoObject["midwest"][4] && cbs.picksInfoObject["midwest"][4][1] && cbs.picksInfoObject["south"] && cbs.picksInfoObject["south"][4] && cbs.picksInfoObject["south"][4][1])) 
 
			{
			cbs.regions = ["South","West","East","Midwest", "Championship"];
			}
		else
			{
			if($(this).attr('class') == "Championship") // did you click on championship?
				return; // cheeky
			cbs.regions = ["South","West","East","Midwest"];

			}

			regions = cbs.regions;

			$("#regionTitle").html($(this).attr('class'));
			if(_gaq){
				//console.log("GOOGLE ANALYTIC: "+$(this).attr('class'));
				_gaq.push(['_trackPageview', $(this).attr('class')]);
			}
			var regionClass = $(this).attr('class');
			var page = "#bracket_zoomed?region=" + regionClass;
			$.mobile.changePage(page);
			
			console.log('regionClass',regionClass);
			var i = 0;
			var len = regions.length;
			while(i < len) {
				if (regions[i] == regionClass) {
					if (i == 0) {
						//console.log(i+(len-1));
						$("#RegionNav .arrow-left").attr("title", regions[i+(len-1)]);
						$("#RegionNav .arrow-right").attr("title", regions[i+1]);
					} if (i == (len-1)) {
						$("#RegionNav .arrow-left").attr("title", regions[i-1]);
						$("#RegionNav .arrow-right").attr("title", regions[i-(len-1)]);
					} else {
						$("#RegionNav .arrow-left").attr("title", regions[i-1]);
						$("#RegionNav .arrow-right").attr("title", regions[i+1]);
					}
					
					//Added to determine which area of the scrollview to scroll to
					if (i == 2 || i == 3)
					{
						moveZoomedInScrollView('right');
					} else {
						moveZoomedInScrollView('left');
					}
				}
				i++;

			}
        });
		
		$('#RegionNav .arrow-left, #RegionNav .arrow-right').click(function ()
        {
            var regions = cbs.regions;
			var regionTitle = $(this).attr("title");
			var page = "#bracket_zoomed?region=" + $(this).attr("title") + "&quick=1";
            		$.mobile.changePage(page);
			$("#regionTitle").html(regionTitle);
			if(_gaq){
				//console.log("GOOGLE ANALYTIC: "+regionTitle);
				_gaq.push(['_trackPageview', regionTitle]);
			}

		if ((regionTitle == "Midwest") || (regionTitle == "East")) {
			// $('#bracketZoomedIn').css("left","").css("right","0");
		} else {
			$('#bracketZoomedIn').css("left","0").css("right","");
		}
		
			var i = 0;
			var len = regions.length;
			while(i < len) {
				if (regions[i] == regionTitle) {
					if (i == 0) {
						//console.log(i+3);
						$("#RegionNav .arrow-left").attr("title", regions[i+(len-1)]);
						$("#RegionNav .arrow-right").attr("title", regions[i+1]);
					} if (i == (len-1)) {
						$("#RegionNav .arrow-left").attr("title", regions[i-1]);
						$("#RegionNav .arrow-right").attr("title", regions[i-(len-1)]);
					} else {
						$("#RegionNav .arrow-left").attr("title", regions[i-1]);
						$("#RegionNav .arrow-right").attr("title", regions[i+1]);
					}
					
					//Added to determine which area of the scrollview to scroll to
					if (i == 2 || i == 3)
					{
						moveZoomedInScrollView('right');
					} else {
						moveZoomedInScrollView('left');
					}
				}
				i++;
			}
        });
		$('#standingspage .ui-simpledialog-container a').live('click', function(){
			var ind = $($('#standingspage .ui-simpledialog-container a')).index(this);
			switch(ind){
				case 0:
					self.sortByScore();
					break;
				case 1:
					self.sortByCorrect();
					break;
				case 2:
					self.sortByBestScore();
					break;
				case 3:
					self.sortByBestCorrect();
					break;
				case 4:
					self.sortByChampion();
					break;
			}
			return false;
		});
    },
	
	reloadData: function ()
    {
		location.reload();
	},
	
    logOut: function ()
    {
		try{
		this.deleteCookie('pid','.cbssports.com');
		} catch (e){
			console.log("Couldn't .cbssports.com delete cookie: "+e);
		}
		
		try{
		this.deleteCookie('pid','m.mayhem.cbssports.com');
		} catch (e){
			console.log("Couldn't m.mayhem.cbssports.com delete cookie: "+e);
		}
		
		try{
		this.deleteCookie('pid');
		} catch (e){
			console.log("Couldn't advancedcontent.trailerparkinteractive.com delete cookie: "+e);
		}
		//$('.ui-page[data-url="brackets"]').empty();
		//location.href = "index.html";
		window.location = "index.html";
    },


    logIn: function ()
    {
		console.log("login");
        var self = this,
			username = $("#username").val(),
			password = $("#password").val(),
			rememberMe = $('#checkremember').is(':checked');
			
			if (MODE_DEV) {
				//url = this.apiUrl(API.login, '', 'userid=' + username + '&password=' + password);
				url = this.apiUrlLogin(API.login, username, password);
			}
			else {
				url = this.apiUrlLogin(API.login, username, password);
			}
			
		//url = PROXY + "http://www.cbssports.com/xml/fantasy/login?partner_id=cbcf439c17c5d0ffe78a82e2645a9e0f&userid%3Dtrailer71%26password%3D7cbs7";
		//url = PROXY + "http://www.cbssports.com/xml/fantasy/login?partner_id=cbcf439c17c5d0ffe78a82e2645a9e0f%26userid%3Drobstemmtp%26password%3Dtrailerpark";
		
		//WANT THIS
		//proxy.php?url=http://www.cbssports.com/xml/fantasy/login?partner_id=cbcf439c17c5d0ffe78a82e2645a9e0f&userid=trailer71&password=abc%40%233%3B
		
		//proxy.php?url=http://www.cbssports.com/xml/fantasy/login?partner_id=cbcf439c17c5d0ffe78a82e2645a9e0f&userid=robstemmtp&password=trailerpark
		
		console.log("final url: " + url);
		

        //url = 'http://www.' + API.base+'/' + API.login + '?partner_id=' + PID + '&userid=' + username + '&password=' + password;
        //console.log(url);

        $.get(url, function (data)
        {
            //console.log(data);
            var login = $(data).find('login'),
				result = login.attr('result');
			console.log("result: " + result);
            if (result == 'ok')
            {
                var name = login.attr('cookie_name'),
					value = login.attr('cookie_value');
				
				console.log("cookie_name: " + name);
				console.log("cookie_value: " + value);
				/*var cookieDom = "";	//was cbssports.com
				if (MODE_DEV) {
					cookieDom = "";	
				}*/	
					
				if ( rememberMe ) {
					self.setCookie(name, value);
					createLocalStorage('rememberMeLS',username);
				}
				else {
					//self.setCookie(name, value, "", 0.0003472); //30 sec
					self.setCookie(name, value, "", 30); //30 days
					eraseLocalStorage('rememberMeLS');
   					$("#username").val("");
				}
                //setCookie: function (name, value, domain, expires, path, secure)

				//self.goToPage = '#brackets';
                $.mobile.changePage('#brackets');
            }
			else {
				//alert("Incorrect Username or Password. Please try again.");
				if(_gaq){
					//console.log("GOOGLE ANALYTIC: login_error_dialog");
					_gaq.push(['_trackPageview', 'login_error_dialog']);
				}
				
				$("#close-login").live('click',function(e) {
					if(_gaq){
						//console.log("GOOGLE ANALYTIC: login");
						_gaq.push(['_trackPageview', 'login']);
					}
				});
				
				$('<div>').simpledialog2({
					mode: 'blank',
					headerText: false,
					headerClose: false,
					forceInput: false,
					blankContent : 
					  "<div class='center-wrapper whiteContentBox'>Incorrect Username or Password. Please try again.</div>" +
					  "<a id='close-login' rel='close' data-role='button' href='#'>OK</a>"
				  })
			}
        });
        return false;
    },
	
	getUsers: function ()
	{
		var self = this,
		//url = this.apiUrl(API.getUsers),
		//url = PROXY + escape("http://" + cbs.activeLeague + ".mayhem.cbssports.com/xml/brackets/get-users?partner_id=" + PID),
		
		//NEED TO REFACTOR THIS - getUsers should be called for each league
		
		users = [];
		
		console.log("getUsers: " + url);
		$.ajax({
            url: url,
			async: false,
			
            success: function (data)
            {
				
				/*<users>
					<user_info team_id="3" team_abbr="BrettRu" team_name="Brett Russell" bracket_count="0"/>
					<user_info team_id="5" team_abbr="DonaldB" team_name="Donald Bossett" bracket_count="1"/>
					<user_info team_id="4" team_abbr="JasonOd" team_name="Jason Odom" bracket_count="1"/>
					<user_info team_id="9" team_abbr="JeremyN" team_name="Jeremy Nelson" bracket_count="0"/>
				</users>
				*/
				
				if($(data).find("users").attr("my_id"))
					cbs.activeTeamId = $(data).find("users").attr("my_id");
				
                $(data).find('user_info').each(function ()
                {
					console.log("found a user_info");
						var user = $(this),
						team_id = team.attr('team_id'),
						team_abbr = team.attr('team_abbr'),
						team_name = team.attr('team_name'),
						bracket_count = team.attr('bracket_count');
												
						users.push({team_id: team_id, team_abbr: team_abbr, team_name: team_name, bracket_count: bracket_count });
						console.log("found a user_info with bracketS:" + bracket_count);
                });
                self.users = users;

            }
            
        });		
		return users;
		
	},
	
    getTeams: function ()
    {
	// cbs.picksInfoObject = {}; // clear any picks from prior sessions
        var self = this,
			url = this.apiUrl(API.getTeams),
			teams = [];
			//console.log("getTeams: " + url);
			
			console.log("getTeams: " + url);
			
        $.ajax({
            url: url,

            success: function (data)
            {


                $(data).find('fantasy_team').each(function ()
                {
					
					if ( $(this).attr('sport') == "mayhem" && ( $(this).attr('mpid') == "9478" || $(this).attr('mpid') == "9477") ) {
						var team = $(this),
						name = team.attr('name'),
						league = { name: team.attr('league_name'), abbreviation: team.attr('league_abbrev') },
						logo = team.attr('logo'),
						baseurl = team.attr('base_url');
						mpid = team.attr('mpid');
						teams.push({name: name, league: league, logo: logo, url: baseurl, mpid: mpid });


					}
                });
                
				self.teams = teams;
			
			for(team in teams)
			{
				/*$.ajax({
					type: "GET",
					url: PROXY + "http://" + teams[team].league.abbreviation + ".mayhem.cbssports.com/xml/owners?partner_id=" + PID,
					dataType: "xml",
					async: false,
					contentType: 'text/xml', 
		
					success: function(data) {
						console.log("owners",data);
						if($(data).find('team').length>0)
							{
							$(data).find('team').each(function(i) {  
								if(!cbs.ownersInfoObject) cbs.ownersInfoObject = {};
								if(!cbs.ownersInfoObject[teams[team].league.abbreviation]) cbs.ownersInfoObject[teams[team].league.abbreviation] = {};
								if(!cbs.ownersInfoObject[teams[team].league.abbreviation][$(this).attr("Team")]) cbs.ownersInfoObject[teams[team].league.abbreviation][$(this).attr("Team")] = {};
								cbs.ownersInfoObject[teams[team].league.abbreviation][$(this).attr("Team")] = {"id":$(this).attr("Id"),"name":$(this).attr("Team"),"logo":$(this).attr("Logo"),"abbrev":$(this).attr("Abbrev")};
								});
							}
						console.log("owners",cbs.ownersInfoObject);
					}		
				});*/
				$.ajax({
					type: "GET",
					url: PROXY + "http://" + teams[team].league.abbreviation + ".mayhem.cbssports.com/xml/brackets/get-users?partner_id=" + PID,
					dataType: "xml",
					async: false,
					contentType: 'text/xml', 
		
					success: function(data) {
						if($(data).find("users").attr("my_id"))
							var myid = $(data).find("users").attr("my_id");
						if($(data).find('user_info').length>0)
							{
							$(data).find('user_info').each(function(i) {  
								if(!cbs.usersInfoObject) cbs.usersInfoObject = {};
								if(!cbs.usersInfoObject[teams[team].league.abbreviation]) cbs.usersInfoObject[teams[team].league.abbreviation] = {};
								if(!cbs.usersInfoObject[teams[team].league.abbreviation][$(this).attr("Team")]) cbs.usersInfoObject[teams[team].league.abbreviation][$(this).attr("Team")] = {};
								cbs.usersInfoObject[teams[team].league.abbreviation][$(this).attr("team_name")] = {"id":$(this).attr("team_id"),"name":$(this).attr("team_name"),"abbrev":$(this).attr("team_abbr"),"bracketCount":$(this).attr("bracket_count")};
								});
							}
						//console.log("users",cbs.usersInfoObject);
					}		
				});	
			}


            },
			//error: function(){
    			//alert('Error retreiving data. Please check your network connection and refresh this page.');
  			//},
            async: false
        });		
		return teams;
    },

// post-load listener.

    afterPageData: function (e, data)
	{
		$("html").removeClass( "ui-loading" );
		if(this.goToPage == "skip")
			this.goToPage = null;
	},

// getPageData: onbeforechange listener



    getPageData: function (e, data)
    { //check to see if data needs to be loaded before loading the page
		closeMenu();
		var self = this;
        if (this.goToPage!='#login' && !self.isLoggedIn())
        {
			e.preventDefault();
			console.log("to Login");
			this.goToPage='#login';
			$.mobile.changePage('#login', { transition: 'none', showLoadMsg: true });
			return false;
        } 
		if(!self.isLoggedIn() && location.hash == '#brackets' && this.goToPage!='#login'){
			e.preventDefault();
			this.goToPage='#login';
			$.mobile.changePage('#login', { transition: 'none', showLoadMsg: true });
			return false;
        }
		/*
		if(self.isLoggedIn() && location.hash == '#login' && this.goToPage != '#brackets'){
			e.preventDefault();
			this.goToPage='#brackets';
			$.mobile.changePage('#brackets');
			return false;
        }
		*/
		/* else if (self.isLoggedIn() && location.hash == '#login'  && this.goToPage!='#brackets'){
			this.goToPage='#brackets';
			$.mobile.changePage('#brackets', { transition: 'none' });
        } */
		//alert(data.toPage)
		if(typeof data.toPage=='object') console.log((!self.isLoggedIn() && location.hash != '#login'  && this.goToPage!='#login'), $(data.toPage));
		console.log('data.toPage ',data,data.toPage, (typeof data.toPage != "string" && this.goToPage && this.goToPage.replace('#', '') == data.toPage.attr('data-url')),(this.goToPage == data.toPage),this.goToPage);
	if(this.goToPage == "skip")
		{
		// popup
		// e.preventDefault();
		// this.goToPage = null;
		return;
		}
	// transparency overlay fix for unexpected browser-nav
	$("#bracketZoomedPage").css("opacity","1");
	$("#bracketZoomedPage").css("display","");
	 // someone hit the browser's back button from the region zoomed-in view. Let's route it correctly.
/*	if(this.goToPage == "#bracket_zoomed" && data.toPage == "http://advancedcontent.trailerparkinteractive.com/CBS/NCAA_Bracket/mike/index.html#bracket_overview")
		{
		// this.goToPage = "#bracket_overview?league=" + cbs.activeLeague + "&skip=1";
		// data.options.reverse=true;
		//window.setTimeout($.mobile.changePage("#bracket_overview?league="+cbs.activeLeague),500);
		$.mobile.changePage("#bracket_overview?league="+cbs.activeLeague);
		return;

				
		}
        console.log("getPageData",e,data,this.goToPage);
        console.log(typeof data.toPage === "string" && (this.goToPage != data.toPage));
*/        if (typeof data.toPage === "string" && (this.goToPage != data.toPage))
        {

            var u = $.mobile.path.parseUrl(data.toPage),
				re = /#(rules|standings|bracket_overview|bracket_zoomed|bracket|matchupPopupPage|matchupPopupPageSingle)/,
				search = u.href.match(re);

            this.goToPage = null;

            if (search && search.length > 0)
            {
				//console.log(u, data.options, data);
                this.loadPage(u, data.options, data);
                e.preventDefault();
                return;
            }

        } else if (typeof data.toPage != "string" && this.goToPage && this.goToPage.replace('#', '') == data.toPage.attr('data-url')) {
		
			return;
		}
        else if (this.goToPage == data.toPage) return;
		console.log('loading page');
        this.loadPage({ hash: location.hash }, data.options, data);
        // e.preventDefault();

    },



	getStandingsForEachTeam: function(teams){
		console.log("getStandingsForEachTeam")
		console.log(teams);
		this.teams = teams;
		var standings = {};
		
		var managerStandings = {};
		if(teams){
			
			//This request is already being made later in the code, but we should be making it earlier.
					$.ajax({
						type: "GET",
						url: PROXY + "http://" + teams[team].league.abbreviation + ".mayhem.cbssports.com/xml/brackets/get-users?partner_id=" + PID,
						dataType: "xml",
						async: false,
						contentType: 'text/xml', 
			
						success: function(data) {
							
							$(data).find('team').each(function(i) {  
								cbs.usersInfoObject[teams[team].league.abbreviation][$(this).attr("team_name")] = {"id":$(this).attr("team_id"),"name":$(this).attr("team_name"),"abbrev":$(this).attr("team_abbr"),"bracketCount":$(this).attr("bracket_count")};
							});
	
						}		
					});
					
			
			
			
			
			for (team in teams){
				
					
				
				var mpid = teams[team].mpid;
				var league = teams[team].league.abbreviation;
				var url = "";
				
				standings[league] = {};
				
				
				
				
				//different url for challenge vs manager
				if ( mpid == "9478" ) 
				{
					url = PROXY + "http://" + league + challengeStandingsURL;
					
					var self = this;
					
					console.log("challstandings URL: " + "http://" + league + challengeStandingsURL);
					$.ajax({
			            url: url,
			            success: function (data)
			            {
							
			            	this.team = self.teams[team];	
							
							var thisName = this.team.name;
							
							var noData = false;
							if ( $(data).find('row').attr('n0') )
							{
								noData = true;
							}
							
							$(data).find('row').each(function(i) {
								
								if( noData)
								
								{
									standings[league][thisName] = {realName:thisName, bracket:1, rank: 0, roundscore: 0, overallscore: 0};
								}
								else
								{
								
									if($(this).attr('teamname') == thisName)
									{
										
										standings[league][$(this).attr('teamname')] = {realName:$(this).attr('teamname'), bracket:1, rank: $(this).attr('rank'), roundscore: $(this).attr('roundscore'), overallscore: $(this).attr('overallscore')};
	
									}
								}
								
							});
							
							
							
			            },
			            async: false
			        });
				}
				else
				{
					url = this.apiUrl(API.standings, league );

					var self = this;
					
					//console.log("standings URL: " + url);
					$.ajax({
			            url: url,
			            success: function (data)
			            {
		
			            	this.team = self.teams[team];	
							var numBrackets = cbs.usersInfoObject[league][this.team.name].bracketCount;
							var teamId = cbs.usersInfoObject[league][this.team.name].id;
							
							$(data).find('row').each(function(i) {
								
								if($(this).attr('team_id')==teamId)
								{
									var bracketNum = findNumberInParentheses($(this).attr('teamname'));
									var realName = removeParenthesesFromString($(this).attr('teamname'));
	
									standings[league][$(this).attr('teamname')] = {realName:realName, bracket:bracketNum, rank: $(this).attr('rank'), correct: $(this).attr('correct'), points: $(this).attr('score'), bestPoints: $(this).attr('bestscore')};

								}
								
							});
							
			            },
			            async: false
			        });
					
					
				}			

				
			}
		}
		console.log("standings: ");
		console.log(standings);
		return standings;
	},
	
	
	
	checkSubmit: function()
		{
		//console.log("checkSubmit");
		if(cbs.picksubmit>0)
			{
			if(cbs.picksubmit<2)
				{
				cbs.picksubmit++;
				window.setTimeout(checkSubmit(),500);
				}
			else
				{
				showSubmittedDialog();
				cbs.picksubmit=0;
				}
			}
		},
	showSubmittedDialog: function()
		{
			if(_gaq){
				//console.log("GOOGLE ANALYTIC: bracket_submitted_dialog");
				_gaq.push(['_trackPageview', 'bracket_submitted_dialog']);
			}
		$('<span>').simpledialog2({
			mode: 'button',
			headerText: 'Alert',
			//headerClose: true,
			buttonPrompt: 'Your bracket has been submitted.',
			buttons : 
			{
				'Ok' : 
				{
					click: function () 
					{									
						$("#bracketSubmit").addClass("ui-disabled");
						this.goToPage = "#bracket_overview";
						$.mobile.changePage(this.goToPage);
						if(_gaq){
							//console.log("GOOGLE ANALYTIC: bracket_overview");
							_gaq.push(['_trackPageview', 'bracket_overview']);
						}
					}
				}
			}
		});
		},

    loadPage: function (page, options, data)
    {
	if(page.hash.indexOf("skip")>-1) // no handling
		{
		$.mobile.changePage(page.hash, options);
		e.preventDefault();
		return;
		}
        //alert("loadPage: " + page);
        var pages = $.mobile.activePage;

       //console.log("data.toPage, page.hash:");
       //console.log(data.toPage, page.hash,pages,page);

        if ((pages && pages.attr('data-url') && page.hash.match('#' + pages.attr('data-url'))) && !(page.hash.match('#bracket_zoomed') && page.hash.match('quick'))) return;
	if(page.hash.match('#bracket_zoomed') && page.hash.match('quick'))
		page.hash = page.hash.replace("&quick=1","");
        //		//console.log(page, pages);




// BRACKETS LIST


        if (page.hash == "#brackets")
        {
            var teams = this.userTeams = this.getTeams();
			
			var html = '';
			
			if (teams.length < 1){
				html += '<div class="whiteContentBoxNoData">You have no CBSSports Fantasy Bracket Games. Please visit <a target="_blank" href="http://www.cbssports.com/fantasy/collegebasketball" > www.cbssports.com/fantasy/\ncollegebasketball</a> from your computer to sign up today.</div>';
				
				html += '<div class="center-wrapper"><a href="javascript:cbs.logOut();" data-role="button" data-inline="true" class="button-blue">Logout</a></div>';
				
				$(':jqmData(url="' + page.hash.replace("#", '') + '")').children(':jqmData(role=content)').children('#brackets').html(html);
			}
			else
			{
			
				//show bracket challenge at the top
				teams.sort(cbs.sort_by('mpid', true, parseInt));
				
				var standings = null;
				if(this.gameIsOn){
					standings = this.getStandingsForEachTeam(teams);
				}
				
				cbs.clearPicksFlag=0;
				
				//do challenge first
							
				//find out number of bracket challenge teams
				var numChallengeBrackets = 0;
				for (var i =0; i< teams.length; i++)
				{
					var mpid = teams[i].mpid;
					if ( mpid == "9478" ) {
						numChallengeBrackets++;
					}
				}
				
				if (numChallengeBrackets > 0)
				{
					console.log('challeng bracket is more than 0 by this many -->',numChallengeBrackets);
					//html += '<a data-league="' + league + '" href="#standings?league=' + league + '" class="bracketLeagueTitle orb bracket-link">' + "Bracket Challenge" + '</a>';
					
					for (var i =0; i< numChallengeBrackets; i++)
					{
						var league = teams[i].league.abbreviation;
						
						html += '<li class="league">';
					html += '<a data-league="' + league + '" href="#standings?league=' + league + '" class="bracketLeagueTitle orb bracket-link" data-team="'+teams[i].name+'">' + "Bracket Challenge" + '</a>';
					
						html += '<a href="#bracket_overview?league=' + league + '" class="bracketTeamTitle bracket-link" data-team="'+teams[i].name+'" data-league="' + teams[i].league.abbreviation + '" data-bracket="">' + teams[i].name + '</a>';
						console.log('html -->',html);
						
						if(this.gameIsOn && standings){
							
							var teamname = teams[i].name;
							var teamDataWeWant = {};
							$.each(standings , function( index, obj ) {
								if (index == league)
								{
									$.each(obj, function( key, team ) {
										
										if ( team.realName == teamname) 
										{
											teamDataWeWant = team;
											console.log("THIS TEAM: " + teamDataWeWant.realName);
											console.log("THIS BRACKET: " + teamDataWeWant.bracket);
										}
									});
								}
							});
	
							//console.log("Challenge Name: " + teamDataWeWant.realName);
							//console.log("Challenge Rank: " + teamDataWeWant.rank);

							html += '<div class="teamData clearfix">' +
									'<div class="rank"><div class="heading">Rank</div><div class="data">'+ teamDataWeWant.rank +'</div></div>' +
									'<div class="points"><div class="heading">Score</div><div class="data">'+ teamDataWeWant.roundscore +'</div></div>' +
									'<div class="bestpoints"><div class="heading">Overall</div><div class="data">'+ teamDataWeWant.overallscore +'</div></div>'+
									'</div>';
							html += '<div class="bracketTeamBottom"></div>';
						}
					}
					
					
					html += '</li>';
					$(':jqmData(url="' + page.hash.replace("#", '') + '")').children(':jqmData(role=content)').children('#brackets').html(html);
				}
				
				
				
							
				//now do the manager
				for (var i =numChallengeBrackets; i < teams.length; i++)
				{			
					
					var mpid = teams[i].mpid,
						leagueName = '';
	
					var league = teams[i].league.abbreviation;
					//console.log("setting league: " + league);
					if(!this.usersInfoObject) this.usersInfoObject = {};
					if(!this.usersInfoObject[league]) this.usersInfoObject[league] = {};
					cbs.picksInfoObject=null;
					
					
					var numBrackets = 1;
	
					leagueName = teams[i].league.name;
					if(cbs.usersInfoObject && cbs.usersInfoObject[teams[i].league.abbreviation] && cbs.usersInfoObject[teams[i].league.abbreviation][teams[i].name])
						numBrackets = cbs.usersInfoObject[teams[i].league.abbreviation][teams[i].name].bracketCount;
					else
						numBrackets=1;
					
					
					if ( numBrackets == 0 && mpid == "9477") numBrackets = 1; //app must show 1st bracket for manager even if not filled out
					
					
					html += '<li class="league">';
					html += '<a data-league="' + league + '" href="#standings?league=' + league + '" class="bracketLeagueTitle orb bracket-link" data-team="'+teams[i].name+'">' + leagueName + '</a>';
					//html += '<a data-league="' + league + '" href="#standings?league=' + league + '" class="bracketLeagueTitle orb bracket-link" >' + leagueName + '</a>';
					
					//console.log("numBrackets" + numBrackets);
					for(j=1; j <= numBrackets; j++)
					{
						
						var numAnnotation = numBrackets > 1 ? (' #' + j ) : '';
								
						html += '<a href="#bracket_overview?league=' + league + '" class="bracketTeamTitle bracket-link" data-team="'+teams[i].name+'" data-league="' + teams[i].league.abbreviation + '" data-bracket="' + j + '">' + teams[i].name + '\'s' + numAnnotation + ' Bracket</a>';
						//}
						
						var teamname = teams[i].name;
						
					
						if(this.gameIsOn && standings){
							
							var teamDataWeWant = {};
							$.each(standings , function( index, obj ) {
								console.log("index: " + index);
								console.log("obj: ",obj);
								if (index == league)
								{
									$.each(obj, function( key, team ) {
										//console.log("key: " + key);
										if ( team.realName == teamname && team.bracket == j) 
										{
											teamDataWeWant = team;
											console.log("THIS TEAM: " + teamDataWeWant.realName);
											console.log("THIS BRACKET: " + teamDataWeWant.bracket);
											console.log("rank: " + teamDataWeWant.rank);
											console.log("score: " + teamDataWeWant.points);
										}
									});
								}
							});
	
								
							html += '<div class="teamData clearfix">' +
									'<div class="rank"><div class="heading">Rank</div><div class="data">'+ teamDataWeWant.rank +'</div></div>' +
									'<div class="correct"><div class="heading">Correct</div><div class="data">'+ teamDataWeWant.correct +'</div></div>' +
									'<div class="points"><div class="heading">Points</div><div class="data">'+ teamDataWeWant.points +'</div></div>' +
									'<div class="bestpoints"><div class="heading">Best Pts</div><div class="data">'+ teamDataWeWant.bestPoints +'</div></div>'+
									'</div>';
		
		
						}
						html += '<div class="bracketTeamBottom"></div>';
					}
					
						
					html += '</li>';
	
					$(':jqmData(url="' + page.hash.replace("#", '') + '")').children(':jqmData(role=content)').children('#brackets').html(html);
					
					
					
				}
				
				
				$("a.bracketTeamTitle").click(function() {
						dataTeam = $(this).attr("data-team");
						dataLeague= $(this).attr("data-league");
						var dataBracket= $(this).attr("data-bracket");
						console.log("setting team ref: " + dataTeam);
						console.log("setting league ref: " + dataLeague);
						console.log("setting bracket ref: " + dataBracket);
	
						if(cbs.usersInfoObject[dataLeague] && cbs.usersInfoObject[dataLeague][dataTeam] && cbs.usersInfoObject[dataLeague][dataTeam].myid)
						{
							cbs.activeTeamId = cbs.usersInfoObject[dataLeague][dataTeam].myid;
							cbs.activeBracketNumber = dataBracket;
						}
						else
						{
							if(cbs.usersInfoObject[dataLeague] && cbs.usersInfoObject[dataLeague][dataTeam] && cbs.usersInfoObject[dataLeague][dataTeam].id)
							{
							cbs.activeTeamId = cbs.usersInfoObject[dataLeague][dataTeam].id;
							cbs.activeBracketNumber = dataBracket;
							}
							else
							{
								console.log("NO USERS INFO");
								cbs.tieBreakerPick=null;
								cbs.activeTeamId = -1 // bracket challenge -- teamid doesnt matter.
								cbs.activeLeague = dataLeague;
								$("li#Tiebreaker").html("");
								$("#TiebreakerLabel").hide();
							}
						}
					});
					
					$("a.bracketLeagueTitle").click(function(e) {
						dataTeam = $(this).attr("data-team");
						dataLeague= $(this).attr("data-league");
						console.log("dataTeam: " + dataTeam);
						console.log("dataLeague: " + dataLeague);
						cbs.activeTeamId = cbs.usersInfoObject[dataLeague][dataTeam].id;
						cbs.activeLeague = dataLeague;
						console.log("activeTeamId: " + cbs.activeTeamId );
					});
				
			
			}
			
			$(':jqmData(url="' + page.hash.replace("#", '') + '")').trigger("create");
	
				this.activeLeague = null;
				this.activeRegion = null;
				this.goToPage = page.hash;
				$.mobile.changePage(page.hash, options);
        } 
		
		
// BRACKETS OVERVIEW
		
		else if ((page.hash.match('#bracket_overview') && page.hash.match('#bracket_overview').length > 0) ||  (page.hash.match('#bracketOverviewPage') && page.hash.match('#bracketOverviewPage').length > 0)){
            var search = page.hash.match(/league=(.+)/);
            //console.log("WILL WE GET IN: " + search[1]);
            if ((search && search.length > 1 ) || this.activeLeague){


		var picks;
        
		var league = (this.activeLeague != null ) ? this.activeLeague : search[1];

		this.activeLeague = league;
		
		console.log("ACTIVE LEAGUE: " + cbs.activeLeague);
		console.log("BRACKET #" + cbs.activeBracketNumber);
		
		if (!this.picksInfoObject) 
			{
			if(cbs.activeTeamId == -1)
				this.getPicks(league);
			else
				this.getPicks(league,cbs.activeTeamId);
			// picks = {};
			// this.picksInfoObject = {};
			}
		// picks = this.getPicks(league, 6);
		// picks = this.getPicks(league);	
		// picks=this.picksInfoObject;
                console.log("PICKS:");
                console.log(this.picksInfoObject);

		var regionName,roundName,gameName;

		$("#bracketZoomedOut ul.region li.round2 ul.matchups li").css("background","").removeClass("picked");
		$("#bracketZoomedOut ul.region li.round3 ul.matchups li").css("background","").removeClass("picked");	
		$("#bracketZoomedOut ul.region li.round4 ul.matchups li").css("background","").removeClass("picked");
		$("#north").css("background","").removeClass("picked");
		$("#south").css("background","").removeClass("picked");
		$("#finals").css("background","").removeClass("picked");
		$("#finalChampion").css("background","").removeClass("picked");
		
		$(".redred").removeClass("redred");
		$(".redgreen").removeClass("redgreen");
		$(".greenred").removeClass("greenred");
		$(".greengreen").removeClass("greengreen");
		$(".redblue").removeClass("redblue");
		$(".bluegreen").removeClass("bluegreen");
		$(".bluered").removeClass("bluered");
		$(".greenblue").removeClass("greenblue");
		
		$(".horizredred").removeClass("horizredred");
		$(".horizredgreen").removeClass("horizredgreen");
		$(".horizgreenred").removeClass("horizgreenred");
		$(".horizgreengreen").removeClass("horizgreengreen");
		$(".horizredblue").removeClass("horizredblue");
		$(".horizbluegreen").removeClass("horizbluegreen");
		$(".horizbluered").removeClass("horizbluered");
		$(".horizgreenblue").removeClass("horizgreenblue");

		$("#bracketZoomedOut ul#BracketSouth li.round1 li").css("background","#333377");
		$("#bracketZoomedOut ul#BracketMidwest li.round1 li").css("background","#333377");
		$("#bracketZoomedOut ul#BracketEast li.round1 li").css("background","#333377");
		$("#bracketZoomedOut ul#BracketWest li.round1 li").css("background","#333377");


		if(this.clearPicksFlag!=1)
			{
			var numPicks=0;
			//console.log("loading picks");
			for(regions in cbs.picksInfoObject) 
				{
				regionName = regions;
				for(rounds in cbs.picksInfoObject[regions]) 
					{
	
					roundName = rounds;
	
					for(pick in cbs.picksInfoObject[regions][rounds]) 
						{
						numPicks++;



						gameName = pick;
						if(regionName == "southeast")
							{
							if(cbs.picksInfoObject[regions][rounds][pick].result)
								if(cbs.picksInfoObject[regions][rounds][pick].result == "right")
									$("#bracketZoomedOut ul#BracketSouth li.round" + roundName + " li.game" + gameName).css("background","#00753a").addClass("right picked");
								else
									$("#bracketZoomedOut ul#BracketSouth li.round" + roundName + " li.game" + gameName).css("background","#7f0f03").addClass("wrong picked");
							else
								$("#bracketZoomedOut ul#BracketSouth li.round" + roundName + " li.game" + gameName).css("background","#333377").addClass("picked");
							}

						if(regionName == "south")
							{
							if(cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result && cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].result)
								{
								t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
								b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
								$("#bracketZoomedOut ul#BracketSouth li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
								}
							else if (cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result)
							{
								t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
								b = "blue";
								$("#bracketZoomedOut ul#BracketSouth li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
							}
							else if (cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].result)
							{
								t = "blue";
								b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
								$("#bracketZoomedOut ul#BracketSouth li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
							}
							else
							{
								$("#bracketZoomedOut ul#BracketSouth li.round" + roundName + " li.game" + gameName).css("background","#333377").addClass("picked");
							}
							}
	
						if(regionName == "southwest")
							{
							if(cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result)
								{
								t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
								b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
								$("#bracketZoomedOut ul#BracketMidwest li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
								}
							else
								$("#bracketZoomedOut ul#BracketMidwest li.round" + roundName + " li.game" + gameName).css("background","#333377").addClass("picked");
							}

						if(regionName == "midwest") // do east for bracket rotation hack
							{
							if(cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result && cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].result)
								{
								t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
								b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
								$("#bracketZoomedOut ul#BracketEast li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
								}
							else if (cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result)
							{
								t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
								b = "blue";
								$("#bracketZoomedOut ul#BracketEast li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
							}
							else if (cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].result)
							{
								t = "blue";
								b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
								$("#bracketZoomedOut ul#BracketEast li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
							}
							else
							{
								$("#bracketZoomedOut ul#BracketEast li.round" + roundName + " li.game" + gameName).css("background","#333377").addClass("picked");
							}
							}
	
						if(regionName == "east") // do midwest for bracket rotation hack
							{
							if(cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result && cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].result)
								{
								t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
								b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
								$("#bracketZoomedOut ul#BracketMidwest li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
								}
							else if (cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result)
							{
								t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
								b = "blue";
								$("#bracketZoomedOut ul#BracketMidwest li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
							}
							else if (cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].result)
							{
								t = "blue";
								b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
								$("#bracketZoomedOut ul#BracketMidwest li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
							}
							else
							{
								$("#bracketZoomedOut ul#BracketMidwest li.round" + roundName + " li.game" + gameName).css("background","#333377").addClass("picked");
							}
							}
	
						if(regionName == "west")
							{
							if(cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result && cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].result)
								{
								t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
								b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
								$("#bracketZoomedOut ul#BracketWest li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
								}
							else if (cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result)
							{
								t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
								b = "blue";
								$("#bracketZoomedOut ul#BracketWest li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
							}
							else if (cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].result)
							{
								t = "blue";
								b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
								$("#bracketZoomedOut ul#BracketWest li.round" + roundName + " li.game" + gameName).addClass(t+b).addClass("picked");
							}
							else
							{
								$("#bracketZoomedOut ul#BracketWest li.round" + roundName + " li.game" + gameName).css("background","#333377").addClass("picked");
							}
							}
	
						if(regionName == "finalfour")
							{
							//console.log($("ul#BracketChampionship li.round" + roundName + " li.game" + gameName));
							$("#bracketZoomedOut ul#BracketChampionship li.round" + roundName + " li.game" + gameName).css("background","#333377").addClass("picked");
							if(roundName == 1) // first round, final four
								{
								if(gameName == 1) // north 
									if(cbs.picksInfoObject["south"][4] && cbs.picksInfoObject["south"][4][1] && cbs.picksInfoObject["south"][4][1].result && cbs.picksInfoObject["west"][4] && cbs.picksInfoObject["west"][4][1] && cbs.picksInfoObject["west"][4][1].result)
										{
										t = (cbs.picksInfoObject["south"][4][1].result == "right" ? "green" : "red");
										b = (cbs.picksInfoObject["west"][4][1].result == "right" ? "green" : "red");
										$("#bracketZoomedOut ul#BracketChampionship2 li#north").addClass(t+b).addClass("picked");
										}
									else if(cbs.picksInfoObject["south"][4] && cbs.picksInfoObject["south"][4][1] && cbs.picksInfoObject["south"][4][1].result)
										{
										t = (cbs.picksInfoObject["south"][4][1].result == "right" ? "green" : "red");
										b = "blue";
										$("#bracketZoomedOut ul#BracketChampionship2 li#north").addClass(t+b).addClass("picked");
										}
									else if(cbs.picksInfoObject["west"][4] && cbs.picksInfoObject["west"][4][1] && cbs.picksInfoObject["west"][4][1].result)
										{
										t = "blue";
										b = (cbs.picksInfoObject["west"][4][1].result == "right" ? "green" : "red");
										$("#bracketZoomedOut ul#BracketChampionship2 li#north").addClass(t+b).addClass("picked");
										}								
									else
									{
										$("#bracketZoomedOut ul#BracketChampionship2 li#north").css("background","#333377").addClass("picked");
									}
								if(gameName == 2) // south 
									if(cbs.picksInfoObject["east"][4] && cbs.picksInfoObject["east"][4][1] && cbs.picksInfoObject["east"][4][1].result && cbs.picksInfoObject["midwest"][4] && cbs.picksInfoObject["midwest"][4][1] && cbs.picksInfoObject["midwest"][4][1].result)
										{
										t = (cbs.picksInfoObject["east"][4][1].result == "right" ? "green" : "red");
										b = (cbs.picksInfoObject["midwest"][4][1].result == "right" ? "green" : "red");
										$("#bracketZoomedOut ul#BracketChampionship2 li#south").addClass(t+b).addClass("picked");
										}
									else if(cbs.picksInfoObject["east"][4] && cbs.picksInfoObject["east"][4][1] && cbs.picksInfoObject["east"][4][1].result)
										{
										t = (cbs.picksInfoObject["east"][4][1].result == "right" ? "green" : "red");
										b = "blue";
										$("#bracketZoomedOut ul#BracketChampionship2 li#south").addClass(t+b).addClass("picked");
										}
									else if(cbs.picksInfoObject["midwest"][4] && cbs.picksInfoObject["midwest"][4][1] && cbs.picksInfoObject["midwest"][4][1].result)
										{
										t = "blue";
										b = (cbs.picksInfoObject["midwest"][4][1].result == "right" ? "green" : "red");
										$("#bracketZoomedOut ul#BracketChampionship2 li#south").addClass(t+b).addClass("picked");
										}
									else
									{
										$("#bracketZoomedOut ul#BracketChampionship2 li#south").css("background","#333377").addClass("picked");
									}
								}
							
							if(roundName == 2) // championship match
								{
								if(gameName == 1) // north
									//console.log("ROB: GameName 1: regions="+regions+"   rounds="+(parseInt(rounds)-1)+"   pick="+((parseInt(pick)*2)-1)+"   name="+cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].name);
									//console.log("ROB: GameName 1: regions="+regions+"   rounds="+(parseInt(rounds)-1)+"   pick="+((parseInt(pick)*2))+"   name="+cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].name);
									
									if(cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result && cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].result)
										{
										t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
										b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
										$("#bracketZoomedOut ul#BracketChampionship2 li#finals").addClass("horiz"+t+b).addClass("picked");
										}
									else if(cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result)
										{
										t = (cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)-1].result == "right" ? "green" : "red");
										b = "blue";
										$("#bracketZoomedOut ul#BracketChampionship2 li#finals").addClass("horiz"+t+b).addClass("picked");
										}
									else if(cbs.picksInfoObject[regions][parseInt(rounds)-1] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)] && cbs.picksInfoObject[regions][parseInt(rounds)-1][(parseInt(pick)*2)].result)
										{
										t = "blue";
										b = (cbs.picksInfoObject[regions][parseInt(rounds)-1][parseInt(pick)*2].result == "right" ? "green" : "red");
										$("#bracketZoomedOut ul#BracketChampionship2 li#finals").addClass("horiz"+t+b).addClass("picked");
										}
									else
									{
										$("#bracketZoomedOut ul#BracketChampionship2 li#finals").css("background","#333377").addClass("picked");
									}
									
									
									
									if(cbs.picksInfoObject[regions][parseInt(rounds)] && cbs.picksInfoObject[regions][parseInt(rounds)][(parseInt(pick)*2)-1] && cbs.picksInfoObject[regions][parseInt(rounds)][(parseInt(pick)*2)-1].result)
										{
											var myresult = "";
										  if(cbs.picksInfoObject[regions][parseInt(rounds)][(parseInt(pick)*2)-1].result == "right") {
											myresult = "greengreen";
										  } else {
											myresult = "redred";  
										  }
										$("#bracketZoomedOut ul#BracketChampion li#finalChampion").addClass(myresult).addClass("picked");
										}
									else
									{
										$("#bracketZoomedOut ul#BracketChampion li#finalChampion").css("background","#333377").addClass("picked");
									}
								}
							
							}
	
						if(regionName == "tiebreaker")
							{
							if(cbs.picksInfoObject[regions][rounds][pick].result)
								if(cbs.picksInfoObject[regions][rounds][pick].result == "right")
									$("#bracketZoomedOut ul#BracketTiebreaker li.round" + roundName + " li.game" + gameName).css("background","#00753a").addClass("right picked");
								else
									$("#bracketZoomedOut ul#BracketTiebreaker li.round" + roundName + " li.game" + gameName).css("background","#7f0f03").addClass("wrong picked");
							else
								$("#bracketZoomedOut ul#BracketTiebreaker li#Tiebreaker").css("background","#333377").addClass("picked");
							}
	
						}	
	
					}


			}
		}
	else // our picks were cleared, make sure everything stays gray.
		{
		console.log("Picks suppressed");
		}				
	
		if(numPicks==63) // we have made all of our picks!
			{
			$("#bracketSubmit").removeClass("ui-disabled");
			}
		else
			{
			$("#bracketSubmit").addClass("ui-disabled");
			}
                leagueName = '';

                for (var team in this.teams)
                {
                    for (var leagueInfo in this.teams[team])
                    {
                        if (this.teams[team][leagueInfo].abbreviation == league)
                        {

                            leagueName = this.teams[team][leagueInfo].name;
                            teamName = this.teams[team].name;
                        }
                    }
                }

                $('#leagueTitle').html(leagueName);
                $('#teamTitle').html(teamName);


                if (!this.bracketInfoObject) this.getInfo();
                this.goToPage = "#bracket_overview";
                $.mobile.changePage(this.goToPage, options);

		// populate picks

		$("#bracketSubmit").unbind("click").click(function() {
			// start terrible poller to avoid nested dialogs
			
			cbs.getTeamRules();
			$("#bracketSubmit").addClass("ui-disabled");
	
			console.log(cbs.activeRules.tiebreaker);
			console.log("Submit Picks Requested");
			//cbs.activeRules.tiebreaker = 0;
			if (cbs.activeRules.tiebreaker == "1" && cbs.activeTeamId != -1)
			{
				$('<div>').simpledialog2({
					mode: 'button',
					headerText: 'Tie-Breaker',
					//headerClose: true,
					buttonPrompt: 'Project the combined final score of the championship',
					buttonInput: true,
					buttons : {
					  'Ok': {
						click: function (e) { 
						if (!$("#bracketOverviewPage p.ui-simpledialog-subtitle .error").html()) {
							$('#bracketOverviewPage p.ui-simpledialog-subtitle').append('<div class="error"></div>');
						}
						if($("#bracketOverviewPage div.ui-simpledialog-controls input").val().length==0) // no tiebreaker entered
							{
							//var oldtext = $("#bracketOverviewPage p.ui-simpledialog-subtitle").html();
							
							$("#bracketOverviewPage p.ui-simpledialog-subtitle .error").html("<span style='color:red;font-size:12px;'>Please enter a numeric value.</span>");
							return false;
							}
						// BUILD PICKS XML
						var picks = {};
						picks.leagueid = cbs.activeLeague;
						picks["team_id"] = cbs.activeTeamId;
						if(cbs.activeBracketNumber)
							picks.bracket_number=cbs.activeBracketNumber;
						else
							picks.bracket_number="1";

						picks.tiebreaker=$.mobile.sdLastInput;
						if(picks.tiebreaker) $("li#Tiebreaker").html(picks.tiebreaker); else $("li#Tiebreaker").html("");
console.log("picks.tiebreaker",picks.tiebreaker);
						var regions = ["south","west","east","midwest","finalfour"];
						//var regions = ["east","west","southwest","southeast","finalfour"];


						for(var ridx in regions)
							{
			
							var temp = cbs.picksInfoObject[regions[ridx]];
			
							picks["region"+ridx] = {"id":regions[ridx]};	
							for(idx1 in temp)
								{
								picks["region"+ridx]["round"+idx1] = {"id":idx1};
								for(idx2 in temp[idx1])
									{
									//picks[regions[ridx]]["round"+idx1].id = idx1;
									picks["region"+ridx]["round"+idx1]["team"+idx2] = {};
									picks["region"+ridx]["round"+idx1]["team"+idx2] = {"order":idx2,"name":temp[idx1][idx2].name};
									}
								}
							}

						var options = { formatOutput: true, rootTagName: 'picks'};

						var xml = $.json2xml(picks, options);

						xml = xml.replace(/round./gi,"round");
						xml = xml.replace(/team./gi,"team");
						xml = xml.replace(/region./gi,"region");
						xml = xml.replace("teamid","team_id");
						xml = 'xml=<?xml version="1.0" ?>\n' + xml;
						xml = xml + '&mode=native&partner_id=' + PID + "&send_cookies=1&send_session=1&full_headers=1&full_status=1";

						xml = xml;

						console.log("xml -->",picks,xml);
						var url = PROXY2 + 'http://' + cbs.activeLeague + '.mayhem.cbssports.com/' + API.setPicks + "?tp_force_available";

						//console.log(url);
						$.ajax({
							type:"POST",
							url: url,
							processData:false,
							async:false,
							data: xml,
							// contentType: "text/xml",
							contentType: "application/x-www-form-urlencoded",		
							// dataType: "xml",	
							success: function(data) {
								console.log("xml post",data);
								//$.mobile.sdCurrentDialog.close();
								window.setTimeout("cbs.showSubmittedDialog()",2000);
								return false;
							}
						});	
						cbs.picksubmit=1;
						// window.setTimeout($("#bracketSubmit").removeClass("ui-disabled"),500); // let the animation finish
						
						
							
						}
						}
						}
				  });
				  $("#bracketOverviewPage div.ui-simpledialog-controls input").attr("maxlength","3");
				  $("#bracketOverviewPage div.ui-simpledialog-controls input").unbind("keydown").keydown(function(event) {
				        // Allow: backspace, delete, tab and escape
				        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || 
				             // Allow: Ctrl+A
				            (event.keyCode == 65 && event.ctrlKey === true) || 
				             // Allow: home, end, left, right
				            (event.keyCode >= 35 && event.keyCode <= 39)) {
				                 // let it happen, don't do anything
				                 return;
				        }
				        else {
				            // Ensure that it is a number and stop the keypress
						var key = String.fromCharCode( event.keyCode );
				            if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
				                event.preventDefault(); 
				            } 
				        }
				    });
					
					$("#bracketOverviewPage div.ui-simpledialog-controls input").unbind("keyup").keyup(function(event) {
							var V = $(this).val();
							if (isNaN(V)) {
								//console.log("Special Character found in tiebreaker removing character");
								$(this).val(V.replace(/[^0-9]/g,''));
							}
				    });
			}
			else 
			{
				// BUILD PICKS XML
				var picks = {};
				picks.leagueid = cbs.activeLeague;
				picks["team_id"] = cbs.activeTeamId;
				picks.bracket_number="1";

				var regions = ["south","west","east","midwest","finalfour"];
				//var regions = ["east","west","southwest","southeast","finalfour"];


				for(var ridx in regions)
					{
	
					var temp = cbs.picksInfoObject[regions[ridx]];
	
					picks["region"+ridx] = {"id":regions[ridx]};	
					for(idx1 in temp)
						{
						picks["region"+ridx]["round"+idx1] = {"id":idx1};
						for(idx2 in temp[idx1])
							{
							//picks[regions[ridx]]["round"+idx1].id = idx1;
							picks["region"+ridx]["round"+idx1]["team"+idx2] = {};
							picks["region"+ridx]["round"+idx1]["team"+idx2] = {"order":idx2,"name":temp[idx1][idx2].name};
							}
						}
					}

				var options = { formatOutput: true, rootTagName: 'picks'};
				var xml = $.json2xml(picks, options);
				xml = xml.replace(/round./gi,"round");
				xml = xml.replace(/team./gi,"team");
				xml = xml.replace(/region./gi,"region");
				xml = xml.replace("teamid","team_id");
				xml = 'xml=<?xml version="1.0" ?>\n' + xml;
				xml = xml + '&mode=native&partner_id=' + PID + "&send_cookies=1&send_session=1&full_headers=1&full_status=1";
				xml = xml;

				console.log("xml -->",picks,xml);
				var url = PROXY2 + 'http://' + cbs.activeLeague + '.mayhem.cbssports.com/' + API.setPicks + "?tp_force_available";

				//console.log(url);
				$.ajax({
					type:"POST",
					url: url,
					processData:false,
					async:false,
					data: xml,
					// contentType: "text/xml",
					contentType: "application/x-www-form-urlencoded",		
					// dataType: "xml",	
					success: function(data) {
						console.log("xml post",data);
						//$.mobile.sdCurrentDialog.close();
						window.setTimeout("cbs.showSubmittedDialog()",2000);
						return false;
					}
				});	
				cbs.picksubmit=1;	    
				

			}
			
		});
			

$(document).delegate('#opendialog', 'click', function() {
  // NOTE: The selector can be whatever you like, so long as it is an HTML element.
  //       If you prefer, it can be a member of the current page, or an anonymous div
  //       like shown.
  $('<div>').simpledialog2({
    mode: 'blank',
    headerText: 'Some Stuff',
    headerClose: true,
    blankContent : 
      "<ul data-role='listview'><li>Some</li><li>List</li><li>Items</li></ul>"+
      // NOTE: the use of rel="close" causes this button to close the dialog.
      "<a rel='close' data-role='button' href='#'>Close</a>"
  })
})



		$("#confirmed-clear").live('click',function(e) {
			cbs.clearPicksFlag=1;
			cbs.picksInfoObject = {};
			$("#bracketZoomedOut ul.region li.round2 ul.matchups li").css("background","#d1d1d1");
			$("#bracketZoomedOut ul.region li.round3 ul.matchups li").css("background","#d1d1d1");	
			$("#bracketZoomedOut ul.region li.round4 ul.matchups li").css("background","#d1d1d1");		
			$("#north").css("background","#d1d1d1");
			$("#south").css("background","#d1d1d1");
			$("#finals").css("background","#d1d1d1");
			$("li#Tiebreaker").html("");
			//console.log("Picks Cleared");
			$("#bracketClear").removeClass("ui-disabled");
			$("#bracketSubmit").addClass("ui-disabled");
			if(_gaq){
				//console.log("GOOGLE ANALYTIC: bracket_overview");
				_gaq.push(['_trackPageview', 'bracket_overview']);
			}
			// e.stopPropogation();
		});
		
		$("#close-clear").live('click',function(e) {
			if(_gaq){
				//console.log("GOOGLE ANALYTIC: bracket_overview");
				_gaq.push(['_trackPageview', 'bracket_overview']);
			}
		});

		$("#bracketClear").unbind('click').click(function() {
			// $("#bracketClear").addClass("ui-disabled");
			
			if(_gaq){
				//console.log("GOOGLE ANALYTIC: clear_dialog");
				_gaq.push(['_trackPageview', 'clear_dialog']);
			}

			$('<div>').simpledialog2({
			    mode: 'blank',
			    headerText: false,
			    headerClose: false,
			    blankContent:				
				 '<div class="center-wrapper whiteContentBox"><h2 class="orb dialog-header">CONFIRM</h2><p class="dialogText">Are you sure you want to clear your bracket? All picks will be lost.</p><a id="confirmed-clear" data-role="button" rel="close" class="button-blue fixedWidthButton">Yes</a><a id="close-clear" href="#" data-role="button" rel="close" class="button-blue fixedWidthButton">No</a></div>'
			   
			   
			  });
			// window.setTimeout($("#no-clear").click(function(e) {$("#bracketClear").removeClass("ui-disabled");e.stopPropogation();}),500);
		});
			

		if(!cbs.gameIsOn) // we're pre-tourney -- kill the red/green classes.
			{
			$(".redred").removeClass("redred");
			$(".redgreen").removeClass("redgreen");
			$(".greenred").removeClass("greenred");
			$(".greengreen").removeClass("greengreen");
			$(".redblue").removeClass("redblue");
			$(".bluegreen").removeClass("bluegreen");
			$(".bluered").removeClass("bluered");
			$(".greenblue").removeClass("greenblue");
			
			$(".horizredred").removeClass("horizredred");
			$(".horizredgreen").removeClass("horizredgreen");
			$(".horizgreenred").removeClass("horizgreenred");
			$(".horizgreengreen").removeClass("horizgreengreen");
			$(".horizredblue").removeClass("horizredblue");
			$(".horizbluegreen").removeClass("horizbluegreen");
			$(".horizbluered").removeClass("horizbluered");
			$(".horizgreenblue").removeClass("horizgreenblue");
			}
		else		// we're post-tourney. kill the sub/clear buttons.
			{
			$("#zoomedOutButtons").hide();
			}


            } else
            {
                if (!pages || (pages.attr('data-url') && pages.attr('data-url') != 'brackets')) $.mobile.changePage("#brackets");
            }
            return;

// ZOOMED REGION


        } else if ((page.hash.match('#bracket_zoomed') && page.hash.match('#bracket_zoomed').length > 0) || (page.hash.match('#bracketZoomedPage') && page.hash.match('#bracketZoomedPage').length > 0))
        {
            var search = page.hash.match(/region=(.+)/);
            //console.log(search);
            if ((search && search.length > 1) || this.activeRegion)
            {
				
				var region = (this.activeRegion!=null && !search)? this.activeRegion : search[1];
				$("#bracketZoomedPage").attr('style','');
				
				this.activeRegion = region;
//console.log("Region set: ",region);
                if (!this.bracketInfoObject) this.getInfo();

                this.injectTeams(region);
		if(!this.gameIsOn)
                	this.injectPicksPre(region);
		else
			this.injectPicksPost(region);


                this.goToPage = "#bracket_zoomed";
                $.mobile.changePage(this.goToPage, options);

            } else
            {
                if (!pages || (pages.attr('data-url') && pages.attr('data-url') != 'brackets')) $.mobile.changePage("#brackets");
            }
            return;
        } else if (page.hash.match("standings") && page.hash.match("standings").length>0 && ( (page.hash.match("league") &&  page.hash.match("league").length>0) || this.activeLeague) )
        {
			//this.activeTeam = $('a[href="'+page.hash+'"]').attr('data-team');
			
			this.activeLeague = (this.activeLeague!=null)?  this.activeLeague : page.hash.split('league=')[1];
			this.activeTeam = null;
			
			for(var team in this.teams){
				
				//if(this.teams[team].league.abbreviation == this.activeLeague) this.activeTeam = team;
				if(this.teams[team].league.abbreviation == this.activeLeague) this.activeTeam = this.teams[team].name, this.activeTeamIndex = team;
			}
			//console.log(this.activeTeam);
            this.goToPage = "#standings";
			$.mobile.changePage('#standings');
			this.loadStandingsPage(page.hash);
            return;
	} else if ((page.hash=="#matchupPopupPage"))
		{
		this.goToPage = "#matchupPopupPage";
		$.mobile.changePage('#matchupPopupPage');
		matchInit();

	} else if (page.hash.match("matchupPopupPageSingle") && page.hash.match("matchupPopupPageSingle").length>0)
		{
		this.goToPage = "#matchupPopupPageSingle";
		$.mobile.changePage('#matchupPopupPageSingle');
		singleMatchInit();

			
        } else if (page.hash.match("rules") && page.hash.match("rules").length>0 && ( (page.hash.match("league") &&  page.hash.match("league").length>0) || this.activeLeague) )
        {
			//this.activeTeam = $('a[href="'+page.hash+'"]').attr('data-team');
			
			this.activeLeague = (this.activeLeague!=null)?  this.activeLeague : page.hash.split('league=')[1];
			this.activeTeam = null;
			
			for(var team in this.teams){
				
				if(this.teams[team].league.abbreviation == this.activeLeague) this.activeTeam = team;
			}
			//console.log(this.activeTeam);
            this.goToPage = "#rules";
			$.mobile.changePage('#rules');
			this.loadRulesPage(page.hash);
            return;
        }

    },

	loadRulesPage:function(){
		
		var self = this;
		//dataTeam = $(this).attr("data-team");
		//dataLeague= $(this).attr("data-league");
		//cbs.activeTeamId = cbs.ownersInfoObject[dataLeague][dataTeam].id;
		
		
		//check if challenge
		var team = cbs.activeTeam;
		//var mpid = this.userTeams[this.activeTeamIndex].mpid;
		var mpid = team.mpid;
		
		var rulesURL = PROXY + "http://" + cbs.activeLeague + ".mayhem.cbssports.com/xml/brackets/get-rules/?partner_id=cbcf439c17c5d0ffe78a82e2645a9e0f";
		if ( mpid == "9478" ) {
			rulesURL = PROXY + challengeRulesURL;
		}
		
		
		$.ajax({
			type: "GET",
			url: rulesURL,
			dataType: "xml",
			async: false,
			contentType: 'text/xml', 

			
			success: function(data) {
								
				var leagueName = $(data).find("rules").attr("name");
				var maxBrackets = $(data).find('rules').attr("max_brackets");
				var tiebreaker = $(data).find('rules').attr("tiebreaker");
					

			
				var info = "";
				
				info += "League Name: " + leagueName;
				info += "<br />Max Brackets: " + maxBrackets;
				info += "<br />Tiebreaker: ";
				info += (tiebreaker == 1) ? "Yes" : "No";
				
				$("#leagueInfo").html(info);
				
				var html = "";
		

				
				html += "<tr><th align='center' class='orb' width='30%'>Round</th>";
				html += "<th align='center' class='orb'>Weight</th><th align='center' class='orb' style='padding: 15px 0 3px 0;' width='30%'>Bonus</th></tr>";
				
				
				$(data).find('round').each(function(i) {  
					
					html += "<tr><td align='center'>" + $(this).attr("round") + "</td><td align='center'>" + $(this).attr("weight") + "</td>";
					html += "<td align='center'>" + $(this).attr("bonus") + "</td></tr>";

				});			
				$("#roundrules").html(html);
					
			}
		});
		
	},


	 loadStandingsPage:function(){
		var self = this;
		this.standingsData = [];
		
		var	teamName = this.activeTeam,
		//leagueName = this.teams[this.activeTeamIndex].league.name;
		//leagueName = this.userTeams[teamName].league.name;
		leagueName = this.teams[this.activeTeamIndex].league.name;
		
		
		console.log("leagueName: " + leagueName);
		console.log("activeLeague: " + cbs.activeLeague);
		
		//let's see what we have 
		console.log("info:", cbs.usersInfoObject);
		
		
		var mpid = this.userTeams[this.activeTeamIndex].mpid;

		console.log("mpid:", mpid);
		
		
		if ( mpid == "9478" ) {
			//bracket challenge
			var html = '<a class="mybracket-single" href="#bracket_overview?league='+self.getLeagueName()+'" data-league="'+self.getLeagueName()+'" data-teamname="'+teamName+'">';
				html += teamName;
				html += '</a>';
				
			$('#mybracket').html(html);
			
			//console.log("challenge standings url: " + self.getLeagueName() + challengeStandingsURL);
			$.ajax({
				type: "GET",
				url: PROXY + "http://" + self.getLeagueName() + challengeStandingsURL,
				dataType: "xml",
				async: false,
				contentType: 'text/xml',
				error: function(){
					
					//show data failure message?
					
  				}, 
	
				success: function(data) {
					
					var counter = 0;
					if ( $(data).find('row').attr('n0') )
					{
						var html = "<p>" + $(data).find('row').attr('n0') + "</p>";
	
						$("#bracketsdata.post").html(html);
						
					}
					else{
						var userTeamNum;
						$(data).find('row').each(function(i) {
								var obj = [];
								obj.rank = $(this).attr("rank");
								obj.teamName = $(this).attr("teamname");
								obj.roundscore = $(this).attr("roundscore");
								obj.score = $(this).attr("overallscore");
								if (obj.teamName == teamName){
									var html = '<div class="userStandings bracketChallenge clearfix">'+
													//'<div class="correct"><div class="heading"></div><div class="data"></div></div>'+
													'<div class="points"><div class="heading">Pts</div><div class="data">'+ obj.score+'</div></div>'+
													'<div class="best"><div class="heading">Round</div><div class="data">'+ obj.roundscore+'</div></div>'+
													'<div class="rank"><div class="heading">Rank</div><div class="data">'+ obj.rank+'</div></div>'+
												'</div>';
									html += '<div class="bracketTeamBottom"></div>';
									
									$("#mybracket").append(html);
									userTeamNum = i;
								}
								self.standingsData[i] = obj;							
								counter++;
								
						});	
						
						$('#mybracket').attr('data-league', self.getLeagueName());
						$('#mybracket').attr('data-teamname', teamName);
						
						
							
						
						$(document).ready(function() {
					   		cbs.sortChallengeByScore(userTeamNum);
					 	});
						
					}
					
					$("#subheader_subtext").html(leagueName);
					
					
				}
			});
		}
		else {
			//bracket manager
			
			
			$.ajax({
					type: "GET",
					url: PROXY + "http://" + self.getLeagueName() + ".mayhem.cbssports.com/print/xml/opm/standings",
					dataType: "xml",
					async: false,
					contentType: 'text/xml', 
		
					success: function(data) {
						
						
						if ( $(data).find('row').attr('n0') )
						{
							var html = "<p>" + $(data).find('row').attr('n0') + "</p>";
							$("#bracketsdata.post").html(html);
							
						}
						else
						{
								
							
							var html = '';
							$(data).find('row').each(function(i) {  
								var obj = {};
								
								
								//var rank = $(this).attr("rank");
								obj.teamName = $(this).attr("teamname");
								obj.teamId = $(this).attr("team_id");
								obj.score = $(this).attr("score");
								obj.bestScore = $(this).attr("bestscore");
								obj.correct = $(this).attr("correct");
								obj.bestCorrect = $(this).attr("bestcorrect");
								obj.champion = $(this).attr("champion");
								obj.rank = $(this).attr("rank");

								
								
								if (self.gameIsOn && obj.teamId == cbs.activeTeamId){
									
									var bracketNum = findNumberInParentheses($(this).attr('teamname'));
									
									
									html += '<a class="mybracket-single" href="#bracket_overview?league='+self.getLeagueName()+'" data-league="'+self.getLeagueName()+'" data-teamname="'+teamName+'" data-bracket="'+bracketNum+'">';
									html += teamName+"'s #" + bracketNum + " Bracket";
									html += '</a>';
									html += '<div class="userStandings clearfix">'+
													'<div class="correct"><div class="heading">Correct</div><div class="data">'+ obj.correct+'</div></div>'+
													'<div class="points"><div class="heading">Pts</div><div class="data">'+ obj.score+'</div></div>'+
													'<div class="best"><div class="heading">Best</div><div class="data">'+ obj.bestScore+'</div></div>'+
													'<div class="rank"><div class="heading">Rank</div><div class="data">'+ obj.rank+'</div></div>'+
												'</div>';
									html += '<div class="bracketTeamBottom"></div>';
									
									//$(':jqmData(url="' + page.hash.replace("#", '') + '")').children(':jqmData(role=content)').children('#brackets').html(html);
								}
								
								
								self.standingsData[i] = obj;
								
							});			
							
							//html += '<a href="#bracket_overview?league=' + league + '" class="mybracket bracket-link" data-team="'+teams[i].name+'" data-league="' + teams[i].league.abbreviation + '" data-bracket="' + j + '">' + teams[i].name + '\'s' + numAnnotation + ' Bracket</a>';
							
							//$(':jqmData(url="' + page.hash.replace("#", '') + '")').children(':jqmData(role=content)').children('#brackets').html(html);
								
							$('#mybracket').html(html);	
							$('#mybracket').attr('data-league', self.getLeagueName());
							$('#mybracket').attr('data-teamname', teamName);
							$("#subheader_subtext").html(leagueName);
											
							$(document).ready(cbs.sortByScore.bind(cbs));
						}			
						
					}
				});
							
			$("a.mybracket-single").click(function() {
						cbs.picksInfoObject=null;
						dataTeam = $(this).attr("data-teamname");
						dataLeague= $(this).attr("data-league");
						var dataBracket= $(this).attr("data-bracket");
						console.log("setting single team ref: " + dataTeam);
						console.log("setting single league ref: " + dataLeague);
						console.log("setting single bracket ref: " + dataBracket);
	
						if(cbs.usersInfoObject[dataLeague] && cbs.usersInfoObject[dataLeague][dataTeam] && cbs.usersInfoObject[dataLeague][dataTeam].myid)
						{
							cbs.activeTeamId = cbs.usersInfoObject[dataLeague][dataTeam].myid;
							cbs.activeBracketNumber = dataBracket;
						}
						else
						{
							if(cbs.usersInfoObject[dataLeague] && cbs.usersInfoObject[dataLeague][dataTeam] && cbs.usersInfoObject[dataLeague][dataTeam].id)
							{
							cbs.activeTeamId = cbs.usersInfoObject[dataLeague][dataTeam].id;
							cbs.activeBracketNumber = dataBracket;
							}
							else
							{
								console.log("NO USERS INFO");
								cbs.tieBreakerPick=null;
								cbs.activeTeamId = -1 // bracket challenge -- teamid doesnt matter.
								cbs.activeLeague = dataLeague;
								$("li#Tiebreaker").html("");
								$("#TiebreakerLabel").hide();
							}
						}
					});
		}
				

	},
	
	getLeagueName:	function (){
		return this.activeLeague ;
	},

		
		
		
	sort_by: function (field, reverse, primer) {
		var key = function (x) {return primer ? primer(x[field]) : x[field]};

	   return function (a,b) {
		   var A = key(a), B = key(b);
		   return (A < B ? -1 : (A > B ? 1 : 0)) * [1,-1][+!!reverse];                  
	   }
	},
	
	sortByMPID: function () {
		var self = this;
		this.bracketsData.sort(self.sort_by('mpid', true, parseInt));
		
		
	},
		
		
	sortByScore: function () {
		//console.log("sort by score");
		var self = this;
		this.standingsData.sort(self.sort_by('score', true, parseInt));
			
				
		var html = '';
		var rank = 1;
		
		html += "<tr><th class='orb' width='40'>RK</th>";
		html += "<th class='orb'>Brackets</th><th class='orb right' style='padding: 15px 0 3px 0;' width='110';>Points</th></tr>";
				
		$.each(this.standingsData, function( i, obj ){
			html += "<tr><td align='center'>" + obj.rank + "</td><td align='left'>" + obj.teamName + "</td>";
					html += "<td align='center'>" + obj.score + "</td></tr>";
					rank++;
			}
		);
		$("#bracketsdata.post").html(html);
		
	},
	
	sortChallengeByScore: function (teamNum,userRank) {
		var self = this;
		this.standingsData.sort(self.sort_by('score', true, parseInt));
			
				
		var html = '';
		var rank = 1;
		var maxResults = 20;
		var counter = 1;
		var userWasInTopResults = false;
		
		html += "<tr><th class='orb' width='40'>RK</th>";
		html += "<th class='orb'>Brackets</th><th class='orb right' style='padding: 15px 0 3px 0;' width='110';>Points</th></tr>";
		
				
		$.each(this.standingsData, function( i, obj ){
			if(i < maxResults) {
				html += "<tr><td align='center'>" + obj.rank + "</td><td align='left'>" + obj.teamName + "</td>";
				html += "<td align='center'>" + obj.score + "</td></tr>";
				rank++;
				if (teamNum == i) { userWasInTopResults = true }
			}
		});
		
		if ( !userWasInTopResults ) 
		{
			//put user at bottom of list®
			var obj = this.standingsData[teamNum];
			html += "<tr><td align='center'>" + obj.rank + "</td><td align='left'>" + obj.teamName + "</td>";
			html += "<td align='center'>" + obj.score + "</td></tr>";
				
		}
		
		$("#bracketsdata.post").html(html);
		
	},
		
	
	



// POST SEASON PICK INJECTION


    injectPicksPost: function (reg)
    {
        if (!reg) reg = "east";
	reg = reg.toLowerCase();
        if (!this.picksInfoObject) 
		{
		// this.getPicks(reg, 6);
		//this.getPicks(reg);
		}
	
	        var info = this.picksInfoObject; // this has all of our picks and results data.
	        // console.log("*** Inject Picks ***", reg);
	        var bracketId = " #bracketZoomedIn ul.region[data-region='"+reg.toLowerCase()+"'] ";


		var bracketInfo = this.bracketInfoObject;

		for(var round in bracketInfo[reg])
			{
			for(var game in bracketInfo[reg][round])
				{
				var listItem = bracketId + " ." + round + " .matchups .game"+parseInt(parseInt(game)+1);
				$(listItem).html('<a  data-round="'+round.substring(5,6) +'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester" class="">' + bracketInfo[reg][round][game][0].seed + " " + this.shortName(bracketInfo[reg][round][game][0].name) + '</a><a  data-round="'+round.substring(5,6)+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester"  class="">' + bracketInfo[reg][round][game][1].seed + " " + this.shortName(bracketInfo[reg][round][game][1].name) + '</a>');
				}
			}




	for (var region in info)
		{
			// Mapping a disparity between picks regions and brackets regions. southwest became midwest and southeast became south. 
		if (region.toLowerCase() == reg.toLowerCase() || (region.toLowerCase() == "southwest" && reg.toLowerCase() == "midwest") || (region.toLowerCase() == "southeast" && reg.toLowerCase() == "south") || (region.toLowerCase() == "finalfour" && reg.toLowerCase() == "championship"))
			{
			if(this.clearPicksFlag == 1) // we have cleared the picks, start from scratch
				{
				this.clearPicksFlag=0;
				for (var round in info[region])
					{  
						// console.log("info rounds" , info[region][round]);
					for(var game in info[region][round])
						{
			                        var self = this;
			                        var listItem = bracketId+ " .round"+round+ " .matchups .game"+game;
			                        var roundData = info[region][round][game];
			                        var home = roundData.home;
			                        var away = roundData.away;
			                        var name = roundData.name;
			                        var winner = roundData.winner;
			                        var result = roundData.result;
						if(round!=1)
							{
							$(listItem).html('<a  data-round="'+round+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester" class=""></a><  data-round="'+round+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester"  class=""></a>');
				                        $(listItem+ " a").click(function (e)
				                        	{
				                        	self.currentRound = $(this).attr('data-round');
				                        	self.currentGame = $(this).attr('data-game');
				                       		});
							}
	                    			}
	                 		}

				}
			else
				{


				for (var round in info[region])
					{  
						//console.log("info rounds" , info[region][round]);
					for(var game in info[region][round])
					{
						var self = this;
						var listItem = bracketId+ " .round"+round+ " .matchups .game"+game;
						var roundData = info[region][round][game];
						var home = roundData.home;
						var away = roundData.away;
						var name = roundData.name;
						var winner = roundData.winner;
						var result = roundData.result;
						var winnerName="";		
						var homeClass = "";
						var awayClass = "";
						var topClass = "";
						var bottomClass = "";

						


						if(reg == "championship")
							{
							if(!cbs.picksInfoObject["finalfour"])
								{ // no picks yet
								ff1 = ""
								ff2 = ""
								ff3 = ""
								}
							else
								{
								if(false && !cbs.picksInfoObject["finalfour"]["1"]["1"].result) // no results yet
									{
	
									ff1 = this.shortName(this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["1"].name].name);
									ff2 = this.shortName(this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["2"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["2"].name].name);
									ff3 = this.abbrMap[cbs.picksInfoObject["finalfour"]["2"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["finalfour"]["2"]["1"].name].name;
		
									$("#bracketZoomedIn #BracketChampionship li.round1 li.game1").html('<a  data-round=1 data-game=2 data-transition="pop" data-rel="dialog" id="tester" class="">' + this.shortName(this.abbrMap[cbs.picksInfoObject["south"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["south"]["4"]["1"].name].name) + '</a><a  data-round=1 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="">' + this.shortName(this.abbrMap[cbs.picksInfoObject["west"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["west"]["4"]["1"].name].name) + '</a>');
						
									$("#bracketZoomedIn #BracketChampionship li.round1 li.game2").html('<a  data-round=1 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="">' + this.shortName(this.abbrMap[cbs.picksInfoObject["east"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["east"]["4"]["1"].name].name) + '</a><a  data-round=1 data-game=2 data-transition="pop" data-rel="dialog" id="tester" class="">' + this.shortName(this.abbrMap[cbs.picksInfoObject["midwest"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["midwest"]["4"]["1"].name].name) + '</a>');
						
						
									$("#bracketZoomedIn #BracketChampionship li.round2 li.game1").html('<a  data-round=2 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="">' + ff1 + '</a><a  data-round=2 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="">' + ff2 + '</a>');
						
						                        $("li.round ul.matchups li.final").html('<a  style="margin-top:-10px;" data-round=3 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="">' + ff3 + '</a>');
						
						                        $("li.round ul.matchups li.final a").click(function (e)
						                        	{
						                        	self.currentRound = $(this).attr('data-round');
						                        	self.currentGame = $(this).attr('data-game');
						                       		});

									}
								else
									{
	
									fft1tClass = ((cbs.picksInfoObject["east"]["4"]["1"].name == name) ? " picked" : "") + (cbs.picksInfoObject["east"]["4"]["1"].result ? ((cbs.picksInfoObject["east"]["4"]["1"].result=="right") ? " right" : " wrong") : "");
									fft1bClass = ((cbs.picksInfoObject["west"]["4"]["1"].name == name) ? " picked" : "") + (cbs.picksInfoObject["west"]["4"]["1"].result ? ((cbs.picksInfoObject["west"]["4"]["1"].result=="right") ? " right" : " wrong") : "");

									fft2tClass = ((cbs.picksInfoObject["midwest"]["4"]["1"].name == name) ? " picked" : "") + (cbs.picksInfoObject["midwest"]["4"]["1"].result ? ((cbs.picksInfoObject["midwest"]["4"]["1"].result=="right") ? " right" : " wrong") : "");
									fft2bClass = ((cbs.picksInfoObject["south"]["4"]["1"].name == name) ? " picked" : "") + (cbs.picksInfoObject["south"]["4"]["1"].result ? ((cbs.picksInfoObject["south"]["4"]["1"].result=="right") ? " right" : " wrong") : "");



									ff1Class = ((cbs.picksInfoObject["finalfour"]["1"]["1"].name == name) ? " picked" : "") + (cbs.picksInfoObject["finalfour"]["1"]["1"].result ? ((cbs.picksInfoObject["finalfour"]["1"]["1"].result=="right") ? " right" : " wrong") : "");
									ff1 = this.shortName(this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["1"].name].name);
									ff2Class = ((cbs.picksInfoObject["finalfour"]["1"]["2"].name == name) ? " picked" : "") + (cbs.picksInfoObject["finalfour"]["1"]["2"].result ? ((cbs.picksInfoObject["finalfour"]["1"]["2"].result=="right") ? " right" : " wrong") : "");
									ff2 = this.shortName(this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["2"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["2"].name].name);
									ff3Class = ((cbs.picksInfoObject["finalfour"]["2"]["1"].name == name) ? " picked" : "") + (cbs.picksInfoObject["finalfour"]["2"]["1"].result ? ((cbs.picksInfoObject["finalfour"]["2"]["1"].result=="right") ? " right" : " wrong") : "");
									ff3 = this.abbrMap[cbs.picksInfoObject["finalfour"]["2"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["finalfour"]["2"]["1"].name].name;
		
									$("#bracketZoomedIn #BracketChampionship li.round1 li.game1").html('<a  data-round=1 data-game=2 data-transition="pop" data-rel="dialog" id="tester" class="' + fft2bClass + '">' + this.shortName(this.abbrMap[cbs.picksInfoObject["south"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["south"]["4"]["1"].name].name) + '</a><a  data-round=1 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="' + fft1bClass + '">' + this.shortName(this.abbrMap[cbs.picksInfoObject["west"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["west"]["4"]["1"].name].name) + '</a>');
						
									$("#bracketZoomedIn #BracketChampionship li.round1 li.game2").html('<a  data-round=1 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="' + fft1tClass + '">' + this.shortName(this.abbrMap[cbs.picksInfoObject["east"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["east"]["4"]["1"].name].name) + '</a><a  data-round=1 data-game=2 data-transition="pop" data-rel="dialog" id="tester" class="' + fft2tClass + '">' + this.shortName(this.abbrMap[cbs.picksInfoObject["midwest"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["midwest"]["4"]["1"].name].name) + '</a>');
						
						
									$("#bracketZoomedIn #BracketChampionship li.round2 li.game1").html('<a  data-round=2 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="' + ff1Class + '">' + ff1 + '</a><a  data-round=2 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="' + ff2Class + '">' + ff2 + '</a>');
						
						                        $("li.round ul.matchups li.final").html('<a  style="margin-top:-10px;" data-round=3 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="' + ff3Class + '">' + ff3 + '</a>');
						
						                        $("li.round ul.matchups li.final a").click(function (e)
						                        	{
						                        	self.currentRound = $(this).attr('data-round');
						                        	self.currentGame = $(this).attr('data-game');
						                       		});

									}
								}
							

							}

						else if(round!=1)
						
							{
							// mesh picks with the odd presentation
							home = info[region][round-1][(game*2)-1];
							away = info[region][round-1][(game*2)];
							if(home.result) // the game already took place
								{
								homeClass = ((home.name == name) ? " picked" : "") + ((home.result=="right") ? " right" : " wrong");
								}
							else
								homeClass = "";
							if(away.result)
								{
								awayClass = ((away.name == name) ? " picked" : "") + ((away.result=="right") ? " right" : " wrong");
								}
							else
								awayClass = "";


								

								//homeName = ((home.name == home.home.name) ? home.home.name : home.away.name);
								//awayName = ((away.name == away.home.name) ? away.home.name : away.away.name);
	
								homeName = this.abbrMap[home.name].seed + ' ' + this.shortName(this.abbrMap[home.name].name);
								awayName = this.abbrMap[away.name].seed + ' ' + this.shortName(this.abbrMap[away.name].name);

					                        $(listItem).html('<a data-round="'+round+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester" class="' + homeClass + '">' + homeName + '</a><a  data-round="'+round+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester"  class="' + awayClass + '">' + awayName + '</a>');
					                        $(listItem+ " a").click(function (e)
					                        	{
					                        	self.currentRound = $(this).attr('data-round');
					                        	self.currentGame = $(this).attr('data-game');
					                       		});
								}
							//else // no result yet, but no link either since we're post-tourney
							//	{

							//	$(listItem).html('<a data-round="'+round+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester" class="' + homeClass + '">' + this.abbrMap[home.name].seed + ' ' + this.shortName(this.abbrMap[home.name].name) + '</a><a data-round="'+round+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester"  class="' + awayClass + '">' + this.abbrMap[away.name].seed + ' ' + this.shortName(this.abbrMap[away.name].name) + '</a>');

							//	}

							//}
						}
					}

				}
			}
		}
    },





 	abbrMap : {},


	shortName : function(str) {
		if(str.length > 11)
			return str.substring(0,9) + "...";
		else
			return str;
	},


// PRE SEASON PICKS INJECTION


    injectPicksPre: function (reg) // this is a pre-season injection of picks we've made. Use post to show off the pick results.
    {
//console.log("entering injectPicksPre",reg,this.activeRegion);
        if (!reg) reg = "east";





	// other parts of the site wish to know if we got all of our region picks in, activating the final four

	if((cbs.picksInfoObject["east"] && cbs.picksInfoObject["east"][4] && cbs.picksInfoObject["east"][4][1] && cbs.picksInfoObject["west"] && cbs.picksInfoObject["west"][4] && cbs.picksInfoObject["west"][4][1] && cbs.picksInfoObject["midwest"] && cbs.picksInfoObject["midwest"][4] && cbs.picksInfoObject["midwest"][4][1] && cbs.picksInfoObject["south"] && cbs.picksInfoObject["south"][4] && cbs.picksInfoObject["south"][4][1])) 
		{
		cbs.regions = ["South","West","East","Midwest", "Championship"];
		}
	else
		{
		cbs.regions = ["South","West","East","Midwest"];
		}

	var regions = cbs.regions;
	var regionTitle = reg;

	$("#regionTitle").html(regionTitle);
	var i = 0;
	var len = regions.length;
	while(i < len) {
		if (regions[i] == regionTitle) {
			if (i == 0) {
				//console.log(i+3);
				$("#RegionNav .arrow-left").attr("title", regions[i+(len-1)]);
				$("#RegionNav .arrow-right").attr("title", regions[i+1]);
			} if (i == (len-1)) {
				$("#RegionNav .arrow-left").attr("title", regions[i-1]);
				$("#RegionNav .arrow-right").attr("title", regions[i-(len-1)]);
			} else {
				$("#RegionNav .arrow-left").attr("title", regions[i-1]);
				$("#RegionNav .arrow-right").attr("title", regions[i+1]);
			}
		}
		i++;
	}


	reg = reg.toLowerCase();
        if (!cbs.picksInfoObject) 
		{
		this.getPicks(reg);
		// this.getPicks(reg);
		}
	
        // var info = this.picksInfoObject; // this has all of our picks and results data.
        // console.log("*** Inject Picks ***", reg);
        var bracketId = " #bracketZoomedIn ul.region[data-region='"+reg.toLowerCase()+"'] ";
	for(i=1; i <= 8; i++)
		{
		for(ii=1; ii <= 4; ii++)
			{

				var listItem = bracketId + " .round" + i + " .matchups .game"+ii;
				$(listItem).html('<a href="#matchupPopupPage" data-round="1" data-game="1" data-transition="pop" data-rel="dialog" id="tester" class=""></a><a href="#matchupPopupPage"  data-round="1" data-game="1" data-transition="pop" data-rel="dialog" id="tester"  class=""></a>');
			}
		}

	var listItem = bracketId+ " .round"+round+ " .matchups .game"+game;

	var bracketInfo = this.bracketInfoObject;




	for(var round in bracketInfo[reg])
		{
		for(var game in bracketInfo[reg][round])
			{
			var listItem = bracketId + " ." + round + " .matchups .game"+parseInt(parseInt(game)+1);
			if(cbs.picksInfoObject[reg] && cbs.picksInfoObject[reg][4]) // we already made picks -- neuter these
				$(listItem).html('<a data-round="'+round.substring(5,6) +'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester" class="">' + bracketInfo[reg][round][game][0].seed + " " + this.shortName(bracketInfo[reg][round][game][0].name) + '</a><a data-round="'+round.substring(5,6)+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester"  class="">' + bracketInfo[reg][round][game][1].seed + " " + this.shortName(bracketInfo[reg][round][game][1].name) + '</a>');
			else
				$(listItem).html('<a href="#matchupPopupPage" data-round="'+round.substring(5,6) +'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester" class="">' + bracketInfo[reg][round][game][0].seed + " " + this.shortName(bracketInfo[reg][round][game][0].name) + '</a><a href="#matchupPopupPage"  data-round="'+round.substring(5,6)+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester"  class="">' + bracketInfo[reg][round][game][1].seed + " " + this.shortName(bracketInfo[reg][round][game][1].name) + '</a>');
			}
		}

		if(reg == "championship") // only the final pick needs the "winner" to be populated -- everyone else just uses home and away.
			{
			if(!cbs.picksInfoObject["finalfour"])
				{ // no picks yet
				ff1 = ""
				ff2 = ""
				ff3 = ""
				}

			else
				{
				if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][1] && cbs.picksInfoObject["finalfour"][1][1] && cbs.picksInfoObject["finalfour"][1][1].name)
					ff1 = this.shortName(this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["1"].name].name);
				else
					ff1 = "";
				if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][1] && cbs.picksInfoObject["finalfour"][1][2] && cbs.picksInfoObject["finalfour"][1][2].name)
					ff2 = this.shortName(this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["2"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["finalfour"]["1"]["2"].name].name);
				else
					ff2 = "";
				if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][2] && cbs.picksInfoObject["finalfour"][2][1] && cbs.picksInfoObject["finalfour"][2][1].name)
					ff3 = this.abbrMap[cbs.picksInfoObject["finalfour"]["2"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["finalfour"]["2"]["1"].name].name;
				else
					ff3 = "";
				}
			if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][2] && cbs.picksInfoObject["finalfour"][2][1] && cbs.picksInfoObject["finalfour"][2][1].name)
				picker = "#matchupPopupPageSingle";
			else
				picker = "#matchupPopupPage";
			
			$("#bracketZoomedIn #BracketChampionship li.round1 li.game1").html('<a href="' + picker + '" data-round=1 data-game=2 data-link="away" data-transition="pop" data-rel="dialog" id="tester" class="">' + this.shortName(this.abbrMap[cbs.picksInfoObject["south"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["south"]["4"]["1"].name].name) + '</a><a href="' + picker + '" data-round=1 data-game=1 data-link="away" data-transition="pop" data-rel="dialog" id="tester" class="">' + this.shortName(this.abbrMap[cbs.picksInfoObject["west"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["west"]["4"]["1"].name].name) + '</a>');

                        $("#bracketZoomedIn #BracketChampionship li.round1 li.game1 a").click(function (e)
                        	{
                        	cbs.currentRound = $(this).attr('data-round');
                        	cbs.currentGame = $(this).attr('data-game');
				cbs.currentLink = $(this).attr('data-link');
                       		});

			$("#bracketZoomedIn #BracketChampionship li.round1 li.game2").html('<a href="' + picker + '" data-round=1 data-game=1 data-link="home" data-transition="pop" data-rel="dialog" id="tester" class="">' + this.shortName(this.abbrMap[cbs.picksInfoObject["east"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["east"]["4"]["1"].name].name) + '</a><a href="' + picker + '" data-round=1 data-game=2 data-link="home" data-transition="pop" data-rel="dialog" id="tester" class="">' + this.shortName(this.abbrMap[cbs.picksInfoObject["midwest"]["4"]["1"].name].seed + ' ' + this.abbrMap[cbs.picksInfoObject["midwest"]["4"]["1"].name].name) + '</a>');

                        $("#bracketZoomedIn #BracketChampionship li.round1 li.game2 a").click(function (e)
                        	{
                        	cbs.currentRound = $(this).attr('data-round');
                        	cbs.currentGame = $(this).attr('data-game');
				cbs.currentLink = $(this).attr('data-link');
                       		});

			$("#bracketZoomedIn #BracketChampionship li.round2 li.game1").html('<a href="' + picker + '" data-round="2" data-game="2" data-link="away" data-transition="pop" data-rel="dialog" id="tester" class="">' + ff1 + '</a><a href="' + picker + '" data-round="2" data-game="1" data-link="home" data-transition="pop" data-rel="dialog" id="tester" class="">' + ff2 + '</a>');

                        $("#bracketZoomedIn #BracketChampionship li.round2 li.game1 a").click(function (e)
                        	{
                        	cbs.currentRound = $(this).attr('data-round');
                        	cbs.currentGame = $(this).attr('data-game');
				cbs.currentLink = $(this).attr('data-link');
                       		});

                        $("li.round ul.matchups li.final").html('<a href="' + picker + '" style="margin-top:-10px;" data-round=3 data-game=1 data-transition="pop" data-rel="dialog" id="tester" class="">' + ff3 + '</a>');

                        $("li.round ul.matchups li.final a").click(function (e)
                        	{
                        	cbs.currentRound = $(this).attr('data-round');
                        	cbs.currentGame = $(this).attr('data-game');
                       		});
			}
		else
	for (var region in cbs.picksInfoObject)
		{
			// Mapping a disparity between picks regions and brackets regions. southwest became midwest and southeast became south. 
		if (region.toLowerCase() == reg.toLowerCase() || (region.toLowerCase() == "southwest" && reg.toLowerCase() == "midwest") || (region.toLowerCase() == "southeast" && reg.toLowerCase() == "south") || (region.toLowerCase() == "finalfour" && reg.toLowerCase() == "championship") || (region.toLowerCase() == "finalfour" && reg.toLowerCase() == "finalfour"))
			{
			if(this.clearPicksFlag == 1) // we have cleared the picks, start from scratch
				{
				for (var round in cbs.picksInfoObject[region])
					{  
						// console.log("info rounds" , cbs.picksInfoObject[region][round]);
					for(var game in cbs.picksInfoObject[region][round])
						{
			                        var self = this;
			                        var listItem = bracketId+ " .round"+round+ " .matchups .game"+game;
			                        var roundData = cbs.picksInfoObject[region][round][game];
			                        var home = roundData.home;
			                        var away = roundData.away;
			                        var name = roundData.name;
			                        var winner = roundData.winner;
			                        var result = roundData.result;
						if(round!=1)
							{
							$(listItem).html('<a href="#matchupPopupPage" data-round="'+round+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester" class=""></a><a href="matchup_popup.html"  data-round="'+round+'" data-game="'+game+'" data-transition="pop" data-rel="dialog" id="tester"  class=""></a>');
				                        $(listItem+ " a").click(function (e)
				                        	{
				                        	cbs.currentRound = $(this).attr('data-round');
				                        	cbs.currentGame = $(this).attr('data-game');
				                       		});
							}
	                    			}
	                 		}
				this.clearPicksFlag=0;
				}
			else
				{





				for (var round in cbs.picksInfoObject[region])
					{  
						//console.log("info rounds" , this.picksInfoObject[region][round]);
					for(var game in cbs.picksInfoObject[region][round])
					{
						var self = this;
						var listItem = bracketId+ " .round"+round+ " .matchups .game"+game;
						var roundData = cbs.picksInfoObject[region][round][game];
						var home = roundData.home;
						var away = roundData.away;
						var name = roundData.name;
						var winner = roundData.winner;
						var result = roundData.result;
						var winnerName="";		
						var homeClass = "";
						var awayClass = "";
						var topClass = "";
						var bottomClass = "";

						if(round!=1)

							{
//console.log(region,round,game);
							// mesh picks with the odd presentation
							home = cbs.picksInfoObject[region][round-1][(game*2)-1];
							away = cbs.picksInfoObject[region][round-1][(game*2)];

							homeClass = "";
							awayClass = "";
							// perform a lookup in the bracket info to match the "name" element of the pick data received from the server.
							
	
							if(region == "finalfour" && round == 2 && game == 1) // exception for region rotation
								$(listItem).html('<a href="#matchupPopupPageSingle"  data-round="'+round+'" data-game="'+(parseInt(game)*2)+'" data-transition="pop" data-rel="dialog" id="tester"  class="' + awayClass + '">' + this.abbrMap[away.name].seed + ' ' + this.shortName(this.abbrMap[away.name].name) + '</a><a href="#matchupPopupPageSingle" data-round="'+round+'" data-game="'+((parseInt(game)*2)-1)+'" data-transition="pop" data-rel="dialog" id="tester" class="' + homeClass + '">' + this.abbrMap[home.name].seed + ' ' + this.shortName(this.abbrMap[home.name].name) + '</a>');
							else
								$(listItem).html('<a href="#matchupPopupPageSingle" data-round="'+round+'" data-game="'+((parseInt(game)*2)-1)+'" data-transition="pop" data-rel="dialog" id="tester" class="' + homeClass + '">' + this.abbrMap[home.name].seed + ' ' + this.shortName(this.abbrMap[home.name].name) + '</a><a href="#matchupPopupPageSingle"  data-round="'+round+'" data-game="'+(parseInt(game)*2)+'" data-transition="pop" data-rel="dialog" id="tester"  class="' + awayClass + '">' + this.abbrMap[away.name].seed + ' ' + this.shortName(this.abbrMap[away.name].name) + '</a>');

				                        $(listItem+ " a").click(function (e)
				                        	{
				                        	cbs.currentRound = $(this).attr('data-round');
				                        	cbs.currentGame = $(this).attr('data-game');
				                       		});

							}
						}
					}

				}
			}
		}
    },

    injectTeams: function (reg)
    {
        if (!this.bracketInfoObject) this.getInfo();
        var info = this.bracketInfoObject;


        $("#bracketZoomedIn #BracketChampionship").hide();
        $("#bracketZoomedIn #BracketTiebreaker").hide();
        // $("#BracketLabels #TiebreakerLabel").hide();
        // $("#BracketLabels #ChampionshipLabel").hide();

		if ((reg.toLowerCase() == 'finalfour') || (reg.toLowerCase() == "championship"))
		{
				$("#BracketLabels #ChamptionshipLabel, #bracketZoomedIn #BracketChampionship").show();
		}

        for (var region in info)
        {
            var r = $(':jqmData(region="' + region + '")');

            var rId = $(r).attr('id')
            var labelId = "#BracketLabels #" + rId + "Label";

            $(labelId).hide();

            $(r).hide();
            if (region.toLowerCase() == reg.toLowerCase())
            {
				//console.log('coordinate tracking',region, reg);
                		if ((reg == "Midwest") || (reg == "East")) {
					//console.log('is midwest or south or championship');
					// $('#bracketZoomedIn').css("left","").css("right","0");
				} else {
					//console.log('is east or west');
					$('#bracketZoomedIn').css("left","0").css("right","");
				}
				
				$(r).show();
                $(labelId).show();

            }
        }

    },




    focusTeam: function (region, rounds, a)
    {
        if (region && rounds && a)
        {
            var teamObject = this.bracketInfoObject[region][rounds][a];
            if (teamObject)
            {
                //console.log("============");
                //console.log(teamObject);
                //console.log("============");
                this.pickerPopupHandle = $('#popup').load('includes/matchup_popup.html', function ()
                {
                    $('#popup').trigger('create');
                });
                $('#team0_button').text(teamObject[0].seed + " " + teamObject[0].name);
                $('#team1_button').text(teamObject[1].seed + " " + teamObject[1].name);
                return true;
            }
        }
        return false;
    },
    getPicks: function (league, teamid)
    {
        if(cbs.activeBracketNumber)
			var extra = "&bracket_number=" + cbs.activeBracketNumber;
		else
			var extra = "";
			var url = (teamid && teamid != '') ? this.apiUrl(API.getPicks, league, '&teamid=' + teamid +  extra) : this.apiUrl(API.getPicks, league);

			var order = [1, 16, 8, 9, 5, 12, 4, 13, 16, 11, 3, 14, 7, 10, 2, 15];
			var picks;
			var self = this;

       console.log("getPicks: " + url);
        $.ajax({
            url: url,
            success: function (data)
            {
                
                picks = data;
            },
            async: false
        });



	if($(picks).find("picks").attr("tiebreaker"))
		{
		cbs.tieBreakerPick = $(picks).find("picks").attr("tiebreaker");
		if(cbs.tieBreakerPick && cbs.tieBreakerPick != "undefined" && cbs.activeTeamId != -1)
			{
			$("li#Tiebreaker").html(cbs.tieBreakerPick); 
			$("#TiebreakerLabel").show();
			}
		else 
			{
			$("li#Tiebreaker").html("");
			$("#TiebreakerLabel").hide();
			}
		}
	else 
		{
		$("li#Tiebreaker").html("");
		$("#TiebreakerLabel").hide();
		}
        this.picksInfoObject = {};



        $(picks).find('region').each(function (r)
        {

            var region = $(this).attr('id');

            self.picksInfoObject[region] = {};

	    

            $(this).find("round").each(function (rnd)
            {
                var pair;
                var round = $(this).attr('id')
                self.picksInfoObject[region][round] = {}
                $(this).find("team").each(function (tm)
                {
                    var game = $(this).attr('order');
                    var home =
					{
					    name: $(this).attr('home')
						, abbr: $(this).attr('home_abbr')
						, seed: $(this).attr('home_seed')
						, score: $(this).attr('hscore')
					};
                    var away =
					{
					    name: $(this).attr('away')
						, abbr: $(this).attr('away_abbr')
						, seed: $(this).attr('away_seed')
						, score: $(this).attr('ascore')
					};

                    pair =
					{
						 name: $(this).attr('name')
						, home: home
						, away: away
						, winner: $(this).attr('winner')
						, result: $(this).attr('result')
					};

                    self.picksInfoObject[region][round][game] = pair;



                });


            });


        });
       
       //console.log("getPicks - Data is: ", self.picksInfoObject)
        
    },

    isLoggedIn: function ()
    {
		//console.log("PID Cookie: " + this.getCookie('pid'));
        if (this.getCookie('pid')) {
			//console.log("found cookie");
			return true;
		}
		//console.log("not logged in");
        return false;
    },
    getInfo: function ()
    {
       // var url = PROXY + escape('http://tptleague.mayhem.cbssports.com/' + API.getInfo + '?partner_id=' + PID + '&test_year=2011'), this.apiUrl(API.getPicks
	   //http://tptleague.mayhem.cbssports.com/xml/brackets/info?partner_id=cbcf439c17c5d0ffe78a82e2645a9e0f
	   //var url = PROXY + "http://" + self.getLeagueName() + ".mayhem.cbssports.com/print/xml/opm/standings",
	   //http://tptleague.mayhem.cbssports.com/xml/brackets/info?partner_id=cbcf439c17c5d0ffe78a82e2645a9e0f
		
		var url = PROXY + escape("http://" + cbs.activeLeague + ".mayhem.cbssports.com/xml/brackets/info?partner_id=" + PID),
			self = this,
			order = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];

		//console.log("getInfO: " + url);
        $.ajax({
            url: url,
            success: function (data)
            {
                ////console.log(data);
                self.bracketInfo = data;
            },
            async: false
        });


        this.bracketInfoObject = {};

        var info = $(this.bracketInfo);
        info.find('region_info').each(function ()
        {

            var region = $(this);
            var pair = [];
            var matches = [];

            $(order).each(function (i, a)
            {
                if (pair.length == 2)
                {
                    matches.push(pair);
                    pair = [];
                }
                var team = {
                    seed: a,
                    name: region.find('team_info[seed="' + a + '"]').attr('name'),
                    abbreviation: region.find('team_info[seed="' + a + '"]').attr('abbr'),
                    round1: region.find('team_info[seed="' + a + '"]').attr('pct_r1'),
                    round2: region.find('team_info[seed="' + a + '"]').attr('pct_r2'),
                    round3: region.find('team_info[seed="' + a + '"]').attr('pct_r3'),
                    round4: region.find('team_info[seed="' + a + '"]').attr('pct_r4'),
                    round5: region.find('team_info[seed="' + a + '"]').attr('pct_r5'),
                    round6: region.find('team_info[seed="' + a + '"]').attr('pct_r6'),
                    blurb: region.find('team_info[seed="' + a + '"]').attr('blurb')
                };
                pair.push(team);
            });
            if (pair.length == 2) matches.push(pair);
            self.bracketInfoObject[region.attr('id')] = { round1: matches };
        });
        //console.log("********************");
        //console.log(self.bracketInfoObject);
        //console.log("********************");

	if(self.bracketInfoObject && self.bracketInfoObject["west"] && self.bracketInfoObject["west"]["round1"] && self.bracketInfoObject["west"]["round1"]["5"] && self.bracketInfoObject["west"]["round1"]["5"]["1"] && self.bracketInfoObject["west"]["round1"]["5"]["1"].abbreviation == "PLAY2")
		{
		self.bracketInfoObject["west"]["round1"]["5"]["1"].abbreviation = "BYU";
		}
	if(self.bracketInfoObject && self.bracketInfoObject["south"] && self.bracketInfoObject["south"]["round1"] && self.bracketInfoObject["south"]["round1"]["0"] && self.bracketInfoObject["south"]["round1"]["0"]["1"] && self.bracketInfoObject["south"]["round1"]["0"]["1"].abbreviation == "PLAY1")
		{
		self.bracketInfoObject["south"]["round1"]["0"]["1"].abbreviation = "WKY";

		}
	if(self.bracketInfoObject && self.bracketInfoObject["midwest"] && self.bracketInfoObject["midwest"]["round1"] && self.bracketInfoObject["midwest"]["round1"]["2"] && self.bracketInfoObject["midwest"]["round1"]["2"]["1"] && self.bracketInfoObject["midwest"]["round1"]["2"]["1"].abbreviation == "PLAY4")
		{
		self.bracketInfoObject["midwest"]["round1"]["2"]["1"].abbreviation = "SFL";
		}
	if(self.bracketInfoObject && self.bracketInfoObject["midwest"] && self.bracketInfoObject["midwest"]["round1"] && self.bracketInfoObject["midwest"]["round1"]["0"] && self.bracketInfoObject["midwest"]["round1"]["0"]["1"] && self.bracketInfoObject["midwest"]["round1"]["0"]["1"].abbreviation == "PLAY3")
		{
		self.bracketInfoObject["midwest"]["round1"]["2"]["1"].abbreviation = "UVM";

		}
	for(var regions in this.bracketInfoObject)
		{
		for(var round in this.bracketInfoObject[regions])
			{
			for(var game in this.bracketInfoObject[regions][round])
				{
		
				// store these for later.
				cbs.abbrMap[this.bracketInfoObject[regions][round][game][0].abbreviation] = {"name":this.bracketInfoObject[regions][round][game][0].name,"seed":this.bracketInfoObject[regions][round][game][0].seed};
				cbs.abbrMap[this.bracketInfoObject[regions][round][game][1].abbreviation] = {"name":this.bracketInfoObject[regions][round][game][1].name,"seed":this.bracketInfoObject[regions][round][game][1].seed};
				
				//console.log("abbr0: " + cbs.abbrMap[this.bracketInfoObject[regions][round][game][0].abbreviation].name + ", seed: " + cbs.abbrMap[this.bracketInfoObject[regions][round][game][0].abbreviation].seed);
				//console.log("abbr1: " + cbs.abbrMap[this.bracketInfoObject[regions][round][game][1].abbreviation].name + ", seed: " + cbs.abbrMap[this.bracketInfoObject[regions][round][game][1].abbreviation].seed);
				}
			}
		}
		cbs.abbrMap["SFL"] = {"name":"So. Florida","seed":"12"};
		cbs.abbrMap["MSVALST"] = {"name":"Ms. Vall. St.","seed":"16"};
		cbs.abbrMap["IONA"] = {"name":"Iona","seed":"14"};
		cbs.abbrMap["CA"] = {"name":"California","seed":"12"};

        return this.bracketInfo;
    },
  	returnPicks: function (league , round)
  	{
  		if(!this.picksInfoObject) this.getPicks(league, round);
  		return this.picksInfoObject;
	  	
	},
    setPicksManager: function (e)
    {
        var tap = e.target;

    },

    setViews: function () { },
    apiUrl: function (api, team, query)
    {
        if (!api) return false;

        var subdomain = team && team != '' ? team + '.mayhem' : 'www',
			q = query && query != '' ? '&' + query : '',
		 	url = 'http://' + subdomain + '.' + API.base + '/' + api + '?partner_id=' + PID + q;

		
		var rnd = Math.floor(Math.random()*1919191)
		if (api == API.getTeams) {
			url += "&show_all=1";
			url += "&cb=" + rnd;
		}
		
	
		if (MODE_DEV) {
			url = PROXY + escape(url);	
		}
        
        return url;

    },

	apiUrlLogin: function (api, user, pass)
    {

        if (!api) return false;

		var url = 'http://www.cbssports.com/xml/fantasy/login?partner_id=' + PID;

        url = "proxy.php?login=true&url=" + escape(url + '&userid=' + user + '&password=' + encodeURIComponent(pass));
		//url = "loginproxy.php?url=" + escape( url + '&userid=' + user + '&password=' + pass );
		
		//console.log("login url: " + url);
        return url;

    },

    // Cookie related functions below
    setCookie: function (name, value, domain, expires, path, secure)
    {
        var today = new Date();
        today.setTime(today.getTime());
        if (expires) expires = expires * 1000 * 60 * 60 * 24;

        var expires_date = new Date(today.getTime() + (expires));
		
		console.log("setting cookie: " + name + "=" + value +
		((expires) ? ";expires=" + expires_date.toGMTString() : "") +
		((path) ? ";path=" + path : "") +
		((domain) ? ";domain=" + domain : "") +
		((secure) ? ";secure" : "") );
		
        document.cookie = name + "=" + value +
		((expires) ? ";expires=" + expires_date.toGMTString() : "") +
		((path) ? ";path=" + path : "") +
		((domain) ? ";domain=" + domain : "") +
		((secure) ? ";secure" : "");
    },

    // this looks for the cookie
    getCookie: function (check_name)
    {
        var a_all_cookies = document.cookie.split(';');
        var a_temp_cookie = '';
        var cookie_name = '';
        var cookie_value = '';
		var found_cookie_value = '';
        var b_cookie_found = false; // set boolean t/f default f

        for (i = 0; i < a_all_cookies.length; i++)
        {
            a_temp_cookie = a_all_cookies[i].split('=');
            cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');
             if (cookie_name == check_name)
            {
				if(a_temp_cookie.length > 1){
					cookie_value = unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, ''));
					//console.log('ROB: Cookie_Value:'+cookie_value+"  ****Cookie_Value*** substring:"+cookie_value.substring(0,1).toLowerCase());
					if(cookie_value.substring(0,1).toLowerCase() != "s"){
						b_cookie_found = true;
						found_cookie_value = cookie_value;
						//don't break because we want to me sure we delete any anonymous cookie
						//break;
					} else if (cookie_value.substring(0,1).toLowerCase() == "s"){
						console.log("ROB: Found a PID cookie with an s at the beginning");
						//Maybe try deleting this cookie here since we really don't ever want an ananymous user cookie
						this.deleteCookie('pid','.cbssports.com');
					}
				}
            }
            a_temp_cookie = null;
            cookie_name = '';
        }
        if (!b_cookie_found)
        {
            return null;
        } else {
			return found_cookie_value;
		}
    },
    // this deletes the cookie when called
    deleteCookie: function (name, domain)
    {
        /*if (this.getCookie(name)) document.cookie = name + "=" +
			((path) ? ";path=" + path : "") +
			((domain) ? ";domain=" + domain : "") +
			";expires=Thu, 01-Jan-1970 00:00:01 GMT";
			*/
			
		var c=document.cookie.split(";");
		for(var i=0;i<c.length;i++){
			var e=c[i].indexOf("=");
			var n=e>-1?c[i].substr(0,e):c[i];
			if(domain){
				document.cookie = n + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; domain="+domain;
			} else {
				document.cookie=n+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
			}
		}
    },
	
	
		



		// Get rules
	getTeamRules: function()
	{
		var teamid = cbs.activeTeamId;
		var league = cbs.activeLeague;
		//console.log("******PULLING RULES*********");
		//console.log('teamId',teamid);
		var url = (teamid && teamid != '') ? this.apiUrl(API.getRules, league, '&teamid=' + teamid ) : this.apiUrl(API.getRules, league); 
		
		$.ajax({
            url: url,
            success: function (data)
            {
                cbs.activeRules = {}
				roundsJSON = {};
				$(data).find('rules').each(function(i){
					//console.log('i',i);
					self = this;
					//console.log('self',data, self);
					cbs.activeRules = {
						name : $(self).attr("name"),
						max_brackets : $(self).attr("max_brackets"),
						tiebreaker : $(self).attr("tiebreaker"),
						rounds : roundsJSON
					};
					console.log(cbs.activeRules,data);
					// stuck
					roundsData = $(data).find('round');
					roundsDataLength = roundsData.length;
					console.log(roundsData,roundsDataLength);
					i = 0;
					while (i < roundsDataLength) {
						j = i+1;
	
						roundId = $(roundsData[i]).attr("round");
						roundWeight = $(roundsData[i]).attr("weight");
						roundBonus = $(roundsData[i]).attr("bonus");
						roundsJSON[j] = { 
							'weight' : roundWeight,
							'bonus' : roundBonus
						};
						i++;
					}
				});

					
            },
            async: false
        });

	}
};

//}());
$('#header, #footer').live('touchmove', function () { return false; })


var cbs = null;
$('#homePage').live('pageinit', function ()
{
    //console.log('test');
});
$(":jqmData(role='page'), :jqmData(role='dialog')").live("pagecreate", function ()
{
    $.mobile.ajaxEnabled = true;
    $.mobile.pushStateEnabled = false;

    //console.log('test')
    if (!cbs) cbs = new mayhem();
});

//cbs = new mayhem();

//console.log(location.hash == '#bracket-overview');
//if(location.hash == '#bracket-overview') $.mobile.changePage('bracket.html', {transition: 'none'});


//Google web font. More info: http://www.google.com/webfonts#UsePlace:use/Collection:Orbitron

WebFontConfig = {
    google: { families: ['Orbitron:500,900:latin'] }
};
(function ()
{
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
    '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

function toggleDiv(divId)
{
    $("#" + divId).toggle();
    var menuBtnTxt = $('#header .btn-menu .ui-btn-text');
    menuBtnTxt.text(menuBtnTxt.text() === 'Menu' ? 'Close' : 'Menu');

    //var viewportHeight = document.documentElement.clientHeight + "px";
    //$('#header .overlay').css('height',viewportHeight).toggle();
    $('#header .overlay').toggle();
}

function closeMenu(divId)
{
    $("#menu-home").hide();
    $("#menu-brackets-home").hide();
    $("#menu").hide();
    $('#header .overlay').hide();
	
	var menuBtnTxt = $('#header .btn-menu .ui-btn-text');
    menuBtnTxt.text('Menu');
}

function menuToggle()
{
	if(location.hash == "#login")
		toggleDiv('menu-home');
	else 
		{
		if(location.hash == "#brackets")
			toggleDiv('menu-brackets-home');
		else
			toggleDiv('menu');
		}
}

function menuClick(divId, pageRef)
{
    //$(".menu").hide();
	menuToggle();
    window.location.href = pageRef;

}

function menuClickExternal(divId, pageRef)
{
	menuToggle();
	window.open(pageRef, '_blank');	
}

function toStandings(){
	$(".menu").hide();
	//console.log("#standings?league=" + cbs.activeLeague);
    $.mobile.changePage("#standings?league=" + cbs.activeLeague);
}

function toRules(){
	$(".menu").hide();
	//console.log("#rules");
    $.mobile.changePage("#rules");
}

findNumberInParentheses = function(stringToSearch){
        
        var indexOfOpenPerentheses = stringToSearch.lastIndexOf("(");
        var indexOfClosePerentheses = stringToSearch.lastIndexOf(")");
        var numberInParentheses = 1;
        if(indexOfOpenPerentheses != -1 && indexOfClosePerentheses != -1 && ((indexOfOpenPerentheses +1) != indexOfClosePerentheses)){
                numberInParentheses = Number(stringToSearch.substring((indexOfOpenPerentheses +1),indexOfClosePerentheses));
        }
        
        if(isNaN(numberInParentheses)){
                return 1;
        } else {
                return numberInParentheses;
        }
}

removeParenthesesFromString = function(stringToSearch){
        var indexOfOpenPerentheses = stringToSearch.lastIndexOf("(");
        var indexOfClosePerentheses = stringToSearch.lastIndexOf(")");
        var cleanedString = stringToSearch;
        if(indexOfOpenPerentheses != -1 && indexOfClosePerentheses != -1 && ((indexOfOpenPerentheses +1) != indexOfClosePerentheses)){
                cleanedString = stringToSearch.substring(0,indexOfOpenPerentheses);
        }
        
        while(cleanedString.substring((cleanedString.length - 1),cleanedString.length) == " ")
        {
                cleanedString = cleanedString.substring(0,(cleanedString.length - 1));
        }
        
        return cleanedString;   
}
		
$(document).delegate('#opendialog', 'click', function() {
	 // NOTE: The selector can be whatever you like, so long as it is an HTML element.
	 //       If you prefer, it can be a member of the current page, or an anonymous div
	 //       like shown.
	 $('<div>').simpledialog2({
	mode: 'blank',
	headerText: false,
	headerClose: false,
	forceInput: false,
	blankContent : 
	  "<div class='center-wrapper whiteContentBox' >" +
	  "<h2 class='orb dialog-header'>SORT BY</h2>" +
	     	"<a href='javascript:sortByScore();' data-role='button' data-inline='true' class='button-blue fullWidthButton'>Score</a>" +
	         "<a href='javascript:sortByCorrect();' data-role='button' data-inline='true' class='button-blue fullWidthButton'>Correct</a>" +
	         "<a href='javascript:sortByBestScore();' data-role='button' data-inline='true' class='button-blue fullWidthButton'>Best Score</a>" +
	         "<a href='javascript:sortByBestCorrect();' data-role='button' data-inline='true' class='button-blue fullWidthButton'>Best Correct</a>" +
	         "<a href='javascript:sortByChampion();' data-role='button' data-inline='true' class='button-blue fullWidthButton'>Champion</a>" +
	     "</div>"
	 })
 })


// ENTIRE-REGION MATCH PICKER -- MERGED IN FOR NAVIGATION HOMOGENIZATION


	var match = {reg:1, round:1, roundLength:0,caro:{},ready:1}

	function matchInit()
		{
		match.reg = cbs.activeRegion.toLowerCase();
		match.dispreg = cbs.activeRegion.toLowerCase();
		var disprnd = parseInt(cbs.currentRound)+1;
		if(!disprnd) disprnd = 2;
		var bracketReg = "";
		$("#bracketZoomedPage").css("opacity","0.75");
		$("#bracketZoomedPage").css("display","block");

		bracketReg = match.reg;

		if(match.reg=="championship") 
			{
			match.reg="finalfour";
			if(disprnd == 2)
				disprnd = "Semifinals";
			else
				disprnd = "Championship"
			}
		if(match.reg=="southwest") 
			{
			bracketReg="midwest";
			}

		if(match.reg=="southeast")	
			{
			bracketReg = "south";
			}

		if(match.reg == "finalfour") // we have the final four -- special handling!
			{
			// verify our four 
			if(cbs.picksInfoObject["east"][4][1] && cbs.picksInfoObject["west"][4][1] && cbs.picksInfoObject["midwest"][4][1] && cbs.picksInfoObject["south"][4][1])
				{
	
				match.caro[match.reg] = {};
				var home = cbs.picksInfoObject["south"]["4"]["1"];
				var away = cbs.picksInfoObject["west"]["4"]["1"];
				match.caro[match.reg]["1"] = '<li class="1"><a href="matchup_analysis.html" class="matchup" style="visibility:hidden;">Matchup Analysis</a>';
				match.caro[match.reg]["1"] += '<a href="#" region="finalfour" round="1" game="1" seed="' + cbs.abbrMap[home.name].seed + '" alt="'+home.name+'" class="team1 team-link">'+cbs.abbrMap[home.name].seed + ' ' + cbs.abbrMap[home.name].name+'</a>';
				match.caro[match.reg]["1"] += '<a href="#" region="finalfour" round="1" game="1" seed = "' + cbs.abbrMap[away.name].seed + '" alt="'+away.name+'" class="team2 team-link">'+cbs.abbrMap[away.name].seed + ' ' + cbs.abbrMap[away.name].name+'</a></li>';

				var home = cbs.picksInfoObject["east"]["4"]["1"];
				var away = cbs.picksInfoObject["midwest"]["4"]["1"];
				match.caro[match.reg]["1"] += '<li class="2"><a href="matchup_analysis.html" class="matchup" style="visibility:hidden;">Matchup Analysis</a>';
				match.caro[match.reg]["1"] += '<a href="#" region="finalfour" round="1" game="2" seed="' + cbs.abbrMap[home.name].seed + '" alt="'+home.name+'" class="team1 team-link">'+cbs.abbrMap[home.name].seed + ' ' + cbs.abbrMap[home.name].name+'</a>';
				match.caro[match.reg]["1"] += '<a href="#" region="finalfour" round="1" game="2" seed = "' + cbs.abbrMap[away.name].seed + '" alt="'+away.name+'" class="team2 team-link">'+cbs.abbrMap[away.name].seed + ' ' + cbs.abbrMap[away.name].name+'</a></li>';
				}
			}

		else
			{
	
			var bracketInfo = cbs.bracketInfoObject;
			// INITIAL BRACKETINFO LOAD OF PICKS (ROUND 1)

			for(var region in bracketInfo)
				{
				match.caro[region] = {};
				for(var round in bracketInfo[region])
					{
					match.caro[region][round.substring(5,6)] = "";
					for(var game in bracketInfo[region][round])
						{
							var home = bracketInfo[region][round][game][0];
							var away = bracketInfo[region][round][game][1];

							if(cbs.picksInfoObject[region] && cbs.picksInfoObject[region][round.substring(5,6)] && cbs.picksInfoObject[region][round.substring(5,6)][parseInt(game)+1] && (cbs.picksInfoObject[region][round.substring(5,6)][parseInt(game)+1].name == home.abbreviation))
								{
								homeClass = " picked";
								console.log("picked");
								}
							else
								homeClass = "";
							if(cbs.picksInfoObject[region] && cbs.picksInfoObject[region][round.substring(5,6)] && cbs.picksInfoObject[region][round.substring(5,6)][parseInt(game)+1] && (cbs.picksInfoObject[region][round.substring(5,6)][parseInt(game)+1].name == away.abbreviation))
								awayClass = " picked";
							else
								awayClass = "";

							if(parseInt(round.substring(5,6))>1)
								match.caro[region][round.substring(5,6)] += '<li class="'+(parseInt(game)+1)+'"><a href="matchup_analysis.html" class="matchup" style="visibility:hidden;">Matchup Analysis</a>';
							else
								match.caro[region][round.substring(5,6)] += '<li class="'+(parseInt(game)+1)+'"><a href="matchup_analysis.html" class="matchup opaque">Matchup Analysis</a>';
							match.caro[region][round.substring(5,6)] += '<a href="#" region="'+region+'" round="'+round.substring(5,6)+'" game="'+(parseInt(game)+1)+'" seed="' + home.seed + '" alt="'+home.abbreviation+'" class="team1 team-link' + homeClass + '">'+home.seed + ' ' + home.name+'</a>';
							match.caro[region][round.substring(5,6)] += '<a href="#" region="'+region+'" round="'+round.substring(5,6)+'" game="'+(parseInt(game)+1)+'" seed = "' + away.seed + '" alt="'+away.abbreviation+'" class="team2 team-link' + awayClass + '">'+away.seed + ' ' + away.name+'</a></li>';
						}
	
					}
				}	
		}
	if(match.reg == "finalfour")
		{
		$("div.debug").html("National " + disprnd);
		}
	else
		{
		if(disprnd < 4)
			$("div.debug").html(match.dispreg.charAt(0).toUpperCase() + match.dispreg.slice(1) + ", Round " + disprnd);
		if(disprnd == 4)
			$("div.debug").html(match.dispreg.charAt(0).toUpperCase() + match.dispreg.slice(1) + ", Regional Semifinals");
		if(disprnd == 5)
			$("div.debug").html(match.dispreg.charAt(0).toUpperCase() + match.dispreg.slice(1) + ", Regional Finals");
		}
	collectMatchPicks(match.reg,1);
	}



















// COLLECT PICKS



function collectMatchPicks(region,rnd)
	{

	match.round = rnd;
	console.log("killed carousel");
	$("#carouselContainer").empty();
	$("#carouselContainer").html('<div class="scroller-container"><ul class="region-list"></ul></div>');
	if(rnd>1) // we base all subsequent rounds on our picks from round1
		{
		match.roundLength=objLength(cbs.picksInfoObject[region][rnd-1])/2;




















// PROCESS REGION END
	if(match.roundLength < 1) // we are done with the round.
		{
		if(region == "finalfour")
			cbs.injectPicksPre("championship");
		else
			{
			cbs.clearPicksFlag=0;
			cbs.injectPicksPre(cbs.activeRegion);
			}
		$("#bracketZoomedPage").css("opacity","1");
		$("#bracketZoomedPage").css("display","");
		cbs.goToPage = "skip";
		$("#goback").click();
		return;
		}























// ROUND END, BEGIN NEXT ROUND PICKS


		match.caro[region][rnd] = "";
		for(var i = 1; i <= (objLength(cbs.picksInfoObject[region][rnd-1])/2); i++)
			{
			var home = cbs.picksInfoObject[region][rnd-1][parseInt(i*2)-1];
			var away = cbs.picksInfoObject[region][rnd-1][parseInt(i*2)];

			if(rnd>1)
				match.caro[region][rnd] += '<li class="'+i+'"><a href="matchup_analysis.html" class="matchup" style="visibility:hidden;">Matchup Analysis</a>';
			else
				match.caro[region][rnd] += '<li class="'+i+'"><a href="matchup_analysis.html" class="matchup">Matchup Analysis</a>';


			if(cbs.picksInfoObject[region][rnd] && cbs.picksInfoObject[region][rnd][i].name == home.name)
				homeClass = " picked";
			else
				homeClass = "";

			if(cbs.picksInfoObject[region][rnd] && cbs.picksInfoObject[region][rnd][i].name == away.name)
				awayClass = " picked";
			else
				awayClass = "";
			


			match.caro[region][rnd] += '<a href="#" region="'+region+'" round="'+rnd+'" game="'+(parseInt(i))+'" seed="' + home.seed + '" alt="'+home.abbr+'" class="team1 team-link' + homeClass + '">'+cbs.abbrMap[home.name].seed + ' ' + cbs.abbrMap[home.name].name +'</a>';
			match.caro[region][rnd] += '<a href="#" region="'+region+'" round="'+rnd+'" game="'+(parseInt(i))+'" seed = "' + away.seed + '" alt="'+away.abbr+'" class="team2 team-link' + awayClass + '">'+cbs.abbrMap[away.name].seed + ' ' + cbs.abbrMap[away.name].name +'</a></li>';
			// i++;
			}
		console.log("Sending over ",match.roundLength,$("ul.region-list li").length,region,rnd,i);
		// match.roundLength = $("ul.region-list li").length;
		$('ul.region-list').html(match.caro[region][rnd]);


		if(match.dispreg == "championship")
			{
			$("div.debug").html("National Championship");
			}
		else
			{
			if(parseInt(parseInt(rnd)+1) < 4)
				$("div.debug").html(match.dispreg.charAt(0).toUpperCase() + match.dispreg.slice(1) + ", Round " + parseInt(parseInt(rnd)+1));
			if(parseInt(parseInt(rnd)+1) == 4)
				$("div.debug").html(match.dispreg.charAt(0).toUpperCase() + match.dispreg.slice(1) + ", Regional Semifinals");
			if(parseInt(parseInt(rnd)+1) == 5)
				$("div.debug").html(match.dispreg.charAt(0).toUpperCase() + match.dispreg.slice(1) + ", Regional Finals");
			}



		}
	else // we're not done yet, continue to the next round 
		{
		match.roundLength=8;
		if(region == "finalfour") match.roundLength=2;
		$('ul.region-list').html(match.caro[region][match.round]);
		console.log("Sending over ",match.roundLength,$("ul.region-list li").length,region,rnd,i);

		}


	if(!cbs.picksInfoObject[match.reg]) cbs.picksInfoObject[match.reg] = {};
	if(!cbs.picksInfoObject[match.reg][rnd]) cbs.picksInfoObject[match.reg][rnd] = {};


















// CLICK HANDLER


		$('.team-link').click(function(){
			if(match.ready != 1) return;
			match.ready=0;
				$(this).addClass("picked");
				$(this).siblings().removeClass("picked");
			numPicked = $(this).parent().parent().find("a.picked").length;
			numTotal = $(this).parent().parent().find("li").length;



			if(!cbs.picksInfoObject[match.reg][match.round][$(this).attr("game")]) cbs.picksInfoObject[match.reg][match.round][$(this).attr("game")] = {};
			cbs.picksInfoObject[match.reg][match.round][$(this).attr("game")].abbr = $(this).attr("alt");
			cbs.picksInfoObject[match.reg][match.round][$(this).attr("game")].name = $(this).attr("alt");
			cbs.picksInfoObject[match.reg][match.round][$(this).attr("game")].fullname = $(this).attr("seed") + " " + cbs.abbrMap[$(this).attr("alt")].name;
			cbs.picksInfoObject[match.reg][match.round][$(this).attr("game")].seed = $(this).attr("seed");
console.log("we think this match length is",match.roundLength);

			if(numPicked == numTotal) { 
				if(match.round == 4 && cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][1] && cbs.picksInfoObject["finalfour"][2][1]) // we picked a finalfour champ
					{
					former = {"abbr":$(this).siblings().last().attr("alt"),"name":$(this).siblings().last().attr("alt"),"fullname":$(this).siblings().last().html(),"seed":$(this).siblings().last().attr("seed")}; // what 
					newpick = {"abbr":$(this).attr("alt"),"name":$(this).attr("alt"),"fullname":$(this).attr('seed') + " " + cbs.abbrMap[$(this).attr("alt")].name,"seed":$(this).attr("seed")}; // what we changed FROM
					var rr = [];
					var ff = [];
					ff[0] = cbs.picksInfoObject["finalfour"][1][1].name;
					ff[1] = cbs.picksInfoObject["finalfour"][1][2].name;
					ff[2] = cbs.picksInfoObject["finalfour"][2][1].name;

					if (ff[0] != cbs.picksInfoObject["east"][4][1].name && ff[0] != cbs.picksInfoObject["west"][4][1].name  && ff[0] != cbs.picksInfoObject["south"][4][1].name   && ff[0] != cbs.picksInfoObject["midwest"][4][1].name)
						{
						cbs.picksInfoObject["finalfour"][1][1].abbr = $(this).attr("alt");
						cbs.picksInfoObject["finalfour"][1][1].name = $(this).attr("alt");
						cbs.picksInfoObject["finalfour"][1][1].fullname = $(this).attr("seed") + " " + cbs.abbrMap[$(this).attr("alt")].name;
						cbs.picksInfoObject["finalfour"][1][1].seed = $(this).attr("seed");
						$("#BracketChampionship li.round2 li.game1 a[data-link='home']").attr("alt",newpick.abbr);
						}
					if (ff[1] != cbs.picksInfoObject["east"][4][1].name && ff[1] != cbs.picksInfoObject["west"][4][1].name  && ff[1] != cbs.picksInfoObject["south"][4][1].name   && ff[1] != cbs.picksInfoObject["midwest"][4][1].name)
						{
						cbs.picksInfoObject["finalfour"][1][2].abbr = $(this).attr("alt");
						cbs.picksInfoObject["finalfour"][1][2].name = $(this).attr("alt");
						cbs.picksInfoObject["finalfour"][1][2].fullname = $(this).attr("seed") + " " + cbs.abbrMap[$(this).attr("alt")].name;
						cbs.picksInfoObject["finalfour"][1][2].seed = $(this).attr("seed");
						$("#BracketChampionship li.round2 li.game1 a[data-link='away']").attr("alt",newpick.abbr);
						}
					if (ff[2] != cbs.picksInfoObject["east"][4][1].name && ff[2] != cbs.picksInfoObject["west"][4][1].name  && ff[2] != cbs.picksInfoObject["south"][4][1].name   && ff[2] != cbs.picksInfoObject["midwest"][4][1].name)
						{
						cbs.picksInfoObject["finalfour"][2][1].abbr = $(this).attr("alt");
						cbs.picksInfoObject["finalfour"][2][1].name = $(this).attr("alt");
						cbs.picksInfoObject["finalfour"][2][1].fullname = $(this).attr("seed") + " " + cbs.abbrMap[$(this).attr("alt")].name;
						cbs.picksInfoObject["finalfour"][2][1].seed = $(this).attr("seed");
						$("#BracketChampionship li.round3 li.game1 a").attr("alt",newpick.abbr);
						}
					}
				if($(this).parent().hasClass(match.roundLength)) 
					{
					collectMatchPicks(region,match.round+1);
					match.ready=1;
					return;
					}
			}			
			match.ready=1;

		});

		$('ul.region-list li').each(function(){
			$(this).css({'width':'206px', 'height': '152px'});
		});	

		$("#matchupPopupPage .scroller-container").jCarouselLite({
			btnNext: ".next,.team-link",
			btnPrev: ".prev",
			visible: 1,
			start: 0,
			cbsWidth: '206',
			cbsHeight: '152px',
			scroll: 1,
			circular: false
		});	
	}






// SINGLE MATCH PICKER - HOMOGENIZED


	var singleMatch = {region:"", caro:{}, rnd:1, game:1, bracketInfo:{},ready:1};


	function singleMatchInit()
		{
		singleMatch.bracketInfo = cbs.bracketInfoObject;
		singleMatch.region = cbs.activeRegion.toLowerCase();
		singleMatch.dispreg = cbs.activeRegion.toLowerCase();
		singleMatch.disprnd = parseInt(cbs.currentRound)+1;
		singleMatch.rnd = cbs.currentRound;
		singleMatch.game = cbs.currentGame;
		if(singleMatch.rnd==1 && singleMatch.region != "championship") // you cant pick brackets
			singleMatch.rnd=2;
		$("#bracketZoomedPage").css("opacity","0.75");
		$("#bracketZoomedPage").css("display","block");

		if(singleMatch.dispreg == "championship")
			{
			if(singleMatch.rnd==1)
				{
				if(singleMatch.game == 1)
					if(cbs.currentLink == "home")
						singleMatch.dispreg = "east";
					else
						singleMatch.dispreg = "west"
				else
					if(cbs.currentLink == "home")
						singleMatch.dispreg = "midwest";
					else
						singleMatch.dispreg = "south"
				singleMatch.disprnd = "Round 5";
				}
			if(singleMatch.rnd==2)
				singleMatch.disprnd = "Semifinals";
			if(singleMatch.rnd==3)
				singleMatch.disprnd = "Championship";


			if(singleMatch.rnd==1)
				$("div.debug").html(singleMatch.dispreg.charAt(0).toUpperCase() + singleMatch.dispreg.slice(1) + ", Regional Finals");
			else
				$("div.debug").html("National " + singleMatch.disprnd);

			}

		else
			{
			

			if((singleMatch.disprnd - 1) < 4)
				$("div.debug").html(singleMatch.dispreg.charAt(0).toUpperCase() + singleMatch.dispreg.slice(1) + ", Round " + (singleMatch.disprnd - 1));
			if((singleMatch.disprnd - 1) == 4)
				$("div.debug").html(singleMatch.dispreg.charAt(0).toUpperCase() + singleMatch.dispreg.slice(1) + ", Regional Semifinals");
			if((singleMatch.disprnd - 1) == 5)
				$("div.debug").html(singleMatch.dispreg.charAt(0).toUpperCase() + singleMatch.dispreg.slice(1) + ", Regional Finals");
			

			}

		if(singleMatch.region == "championship") // special handling
			{
			if(singleMatch.rnd == 1) // semifinals
				{
				if(singleMatch.game == 1) // east/west
					{
					if(cbs.currentLink == "home") // east
						{
						var home = cbs.picksInfoObject["east"][3][1];
						var away = cbs.picksInfoObject["east"][3][2];
						if(!home.seed)
							home.seed = cbs.abbrMap[home.name].seed;
						if(!away.seed)
							away.seed = cbs.abbrMap[away.name].seed;
						//if(!home.abbreviation)
							home.abbreviation = home.name;
						//if(!away.abbreviation)
							away.abbreviation = away.name;
						homename = cbs.abbrMap[home.name].name;
						awayname = cbs.abbrMap[away.name].name;
						}
					if(cbs.currentLink == "away") // west
						{
						var home = cbs.picksInfoObject["west"][3][1];
						var away = cbs.picksInfoObject["west"][3][2];
						if(!home.seed)
							home.seed = cbs.abbrMap[home.name].seed;
						if(!away.seed)
							away.seed = cbs.abbrMap[away.name].seed;
						//if(!home.abbreviation)
							home.abbreviation = home.name;
						//if(!away.abbreviation)
							away.abbreviation = away.name;
						homename = cbs.abbrMap[home.name].name;
						awayname = cbs.abbrMap[away.name].name;
						}

					}
				if(singleMatch.game == 2) // south/midwest
					{
					if(cbs.currentLink == "home") // east
						{
						var home = cbs.picksInfoObject["midwest"][3][1];
						var away = cbs.picksInfoObject["midwest"][3][2];
						if(!home.seed)
							home.seed = cbs.abbrMap[home.name].seed;
						if(!away.seed)
							away.seed = cbs.abbrMap[away.name].seed;
						//if(!home.abbreviation)
							home.abbreviation = home.name;
						//if(!away.abbreviation)
							away.abbreviation = away.name;
						homename = cbs.abbrMap[home.name].name;
						awayname = cbs.abbrMap[away.name].name;
						}
					if(cbs.currentLink == "away") // west
						{
						var home = cbs.picksInfoObject["south"][3][1];
						var away = cbs.picksInfoObject["south"][3][2];
						if(!home.seed)
							home.seed = cbs.abbrMap[home.name].seed;
						if(!away.seed)
							away.seed = cbs.abbrMap[away.name].seed;
						//if(!home.abbreviation)
							home.abbreviation = home.name;
						//if(!away.abbreviation)
							away.abbreviation = away.name;
						homename = cbs.abbrMap[home.name].name;
						awayname = cbs.abbrMap[away.name].name;
						}
					}
				}

			if(singleMatch.rnd == 2) // final
				{
				if(singleMatch.game == 2)
					{
					var home = cbs.picksInfoObject["south"][4][1];
					var away = cbs.picksInfoObject["west"][4][1];
					if(!home.seed)
						home.seed = cbs.abbrMap[home.name].seed;
					if(!away.seed)
						away.seed = cbs.abbrMap[away.name].seed;
					//if(!home.abbreviation)
						home.abbreviation = home.name;
					//if(!away.abbreviation)
						away.abbreviation = away.name;
					homename = cbs.abbrMap[home.name].name;
					awayname = cbs.abbrMap[away.name].name;
					
					}
				if(singleMatch.game == 1)
					{
					
					var home = cbs.picksInfoObject["east"][4][1];
					var away = cbs.picksInfoObject["midwest"][4][1];
					if(!home.seed)
						home.seed = cbs.abbrMap[home.name].seed;
					if(!away.seed)
						away.seed = cbs.abbrMap[away.name].seed;
					//if(!home.abbreviation)
						home.abbreviation = home.name;
					//if(!away.abbreviation)
						away.abbreviation = away.name;
					homename = cbs.abbrMap[home.name].name;
					awayname = cbs.abbrMap[away.name].name;


					}
				}
				

			if(singleMatch.rnd == 3) // the final
				{
				var home = cbs.picksInfoObject["finalfour"][1][1];
				var away = cbs.picksInfoObject["finalfour"][1][2];
				if(!home.seed)
					home.seed = cbs.abbrMap[home.name].seed;
				if(!away.seed)
					away.seed = cbs.abbrMap[away.name].seed;
				//if(!home.abbreviation)
					home.abbreviation = home.name;
				//if(!away.abbreviation)
					away.abbreviation = away.name;
				homename = cbs.abbrMap[home.name].name;
				awayname = cbs.abbrMap[away.name].name;
				}
	

			
			}
		else
			{
			if(singleMatch.rnd==2) // use bracketdata
				{
				var home = singleMatch.bracketInfo[singleMatch.region]["round"+String(singleMatch.rnd-1)][parseInt(singleMatch.game)-1][0];
				var away = singleMatch.bracketInfo[singleMatch.region]["round"+String(singleMatch.rnd-1)][parseInt(singleMatch.game)-1][1];
				var homename = home.name;
				var awayname = away.name;
				}
			else	// use picks data, rounds 3/4
				{
	
				if(singleMatch.game % 2) // odd -- games 1/3/5/7 grab the next, else, previous ; round 3 game 1/2 and 3/4; round 4 game 1/2	3.1 = 1.1 and 1.2; 3.2 = 1.3 and 1.4; 3.3 = 1.5 and 1.6; 3.4 = 1.7 and 1.8; 4.1 = 2.1 and 2.2, 4.2 = 2.3 and 2.4
					{
					var home = cbs.picksInfoObject[singleMatch.region][singleMatch.rnd-2][parseInt(singleMatch.game)*2-1];
					var away = cbs.picksInfoObject[singleMatch.region][singleMatch.rnd-2][(parseInt(singleMatch.game)*2)];
					}
				else	// games 2/4/6/8
					{
					var home = cbs.picksInfoObject[singleMatch.region][singleMatch.rnd-2][(parseInt(singleMatch.game)*2)-1];
					var away = cbs.picksInfoObject[singleMatch.region][singleMatch.rnd-2][parseInt(singleMatch.game)*2];
					}
				if(!home.seed)
					home.seed = cbs.abbrMap[home.name].seed;
				if(!away.seed)
					away.seed = cbs.abbrMap[away.name].seed;
				if(!home.abbreviation)
					home.abbreviation = home.name;
				if(!away.abbreviation)
					away.abbreviation = away.name;
				homename = cbs.abbrMap[home.name].name;
				awayname = cbs.abbrMap[away.name].name;
			
				}
			}


		var caro="";
		if(singleMatch.rnd>1)
			caro += '<li class="'+singleMatch.game+'"><a href="matchup_analysis.html" class="matchup" style="visibility:hidden;">Matchup Analysis</a>';
		else
			caro += '<li class="'+singleMatch.game+'"><a href="matchup_analysis.html" class="matchup opaque">Matchup Analysis</a>';
		caro += '<a href="#" seed="' + home.seed + '" alt="'+home.abbreviation+'" class="team1 team-link opaque" data-link="home">'+home.seed + ' ' + homename+'</a>';
		caro += '<a href="#" seed = "' + away.seed + '" alt="'+away.abbreviation+'" class="team2 team-link opaque" data-link="away">'+away.seed + ' ' + awayname+'</a></li>';
console.log(caro);
		$("#singleContainer").html(caro);

		$('.team-link').click(function(e){
			if(singleMatch.ready != 1) return;
			singleMatch.ready=0;


				$(this).addClass("picked")
				$(this).siblings().removeClass("picked");
			// cbs.currentLink = $(this).attr("data-link");
			if(String(singleMatch.rnd).length>1 && singleMatch.region != "championship")
				{
				console.log(singleMatch.rnd);
				console.log(singleMatch.rnd.substring(5,6));
				singleMatch.rnd = singleMatch.rnd.substring(5,6);
				}

			former = {"abbr":$(this).siblings().last().attr("alt"),"name":$(this).siblings().last().attr("alt"),"fullname":$(this).siblings().last().html(),"seed":$(this).siblings().last().attr("seed")}; // what 
			newpick = {"abbr":$(this).attr("alt"),"name":$(this).attr("alt"),"fullname":$(this).attr('seed') + " " + cbs.abbrMap[$(this).attr("alt")].name,"seed":$(this).attr("seed")}; // what we changed FROM

			// NOW we go cascade this change and remove the FROM from all picks
			if(singleMatch.region == "championship")
				{
				if(singleMatch.rnd == 1) // we may need to cascade to final round
					{
					if(singleMatch.game == 1) // east/west
						{
						if(cbs.currentLink == "home") // east
							{
							if(cbs.picksInfoObject["east"][4][1].name == former.name)
								{
								cbs.picksInfoObject["east"][4][1].name = newpick.name;
								cbs.picksInfoObject["east"][4][1].fullname = newpick.fullname;
								cbs.picksInfoObject["east"][4][1].seed = newpick.seed;
								cbs.picksInfoObject["east"][4][1].abbr = newpick.abbr;
								$("#BracketChampionship li.round1 li.game1 a[data-link='home']").attr("alt",newpick.abbr);
								}
							}
						if(cbs.currentLink == "away") // west
							{
							if(cbs.picksInfoObject["west"][4][1].name == former.name)
								{
								cbs.picksInfoObject["west"][4][1].name = newpick.name;
								cbs.picksInfoObject["west"][4][1].fullname = newpick.fullname;
								cbs.picksInfoObject["west"][4][1].seed = newpick.seed;
								cbs.picksInfoObject["west"][4][1].abbr = newpick.abbr;
								$("#BracketChampionship li.round1 li.game1 a[data-link='away']").attr("alt",newpick.abbr);
								}
							}

						
						if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][1][1].name == former.name) // we need to replace the winner also
							{
							cbs.picksInfoObject["finalfour"][1][1].name = newpick.name;
							cbs.picksInfoObject["finalfour"][1][1].fullname = newpick.fullname;
							cbs.picksInfoObject["finalfour"][1][1].seed = newpick.seed;
							cbs.picksInfoObject["finalfour"][1][1].abbr = newpick.abbr;
							$("#BracketChampionship li.round2 li.game1 a[data-link='away']").attr("alt",newpick.abbr);
							}
						if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][1][2].name == former.name) // we need to replace the winner also
							{
							cbs.picksInfoObject["finalfour"][1][2].name = newpick.name;
							cbs.picksInfoObject["finalfour"][1][2].fullname = newpick.fullname;
							cbs.picksInfoObject["finalfour"][1][2].seed = newpick.seed;
							cbs.picksInfoObject["finalfour"][1][2].abbr = newpick.abbr;
							$("#BracketChampionship li.round1 li.game1 a[data-link='home']").attr("alt",newpick.abbr);
							}
						if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][2][1].name == former.name) // we need to replace the winner also
							{
							cbs.picksInfoObject["finalfour"][2][1].name = newpick.name;
							cbs.picksInfoObject["finalfour"][2][1].fullname = newpick.fullname;
							cbs.picksInfoObject["finalfour"][2][1].seed = newpick.seed;
							cbs.picksInfoObject["finalfour"][2][1].abbr = newpick.abbr;
							$("#BracketChampionship li.round3 li.final a").attr("alt",newpick.abbr);			
							}

						}
					if(singleMatch.game == 2) // east/west
						{
						if(cbs.currentLink == "home") // midwest
							{
							if(cbs.picksInfoObject["midwest"][4][1].name == former.name)
								{
								cbs.picksInfoObject["midwest"][4][1].name = newpick.name;
								cbs.picksInfoObject["midwest"][4][1].fullname = newpick.fullname;
								cbs.picksInfoObject["midwest"][4][1].seed = newpick.seed;
								cbs.picksInfoObject["midwest"][4][1].abbr = newpick.abbr;
								$("#BracketChampionship li.round1 li.game1 a[data-link='home']").attr("alt",newpick.abbr);
								}
							}
						if(cbs.currentLink == "away") // south
							{
							if(cbs.picksInfoObject["south"][4][1].name == former.name)
								{
								cbs.picksInfoObject["south"][4][1].name = newpick.name;
								cbs.picksInfoObject["south"][4][1].fullname = newpick.fullname;
								cbs.picksInfoObject["south"][4][1].seed = newpick.seed;
								cbs.picksInfoObject["south"][4][1].abbr = newpick.abbr;
								$("#BracketChampionship li.round1 li.game1 a[data-link='away']").attr("alt",newpick.abbr);
								}
							}

						if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][1][1].name == former.name) // we need to replace the winner also
							{
							cbs.picksInfoObject["finalfour"][1][1].name = newpick.name;
							cbs.picksInfoObject["finalfour"][1][1].fullname = newpick.fullname;
							cbs.picksInfoObject["finalfour"][1][1].seed = newpick.seed;
							cbs.picksInfoObject["finalfour"][1][1].abbr = newpick.abbr;
							$("#BracketChampionship li.round2 li.game1 a[data-link='away']").attr("alt",newpick.abbr);
							}
						if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][1][2].name == former.name) // we need to replace the winner also
							{
							cbs.picksInfoObject["finalfour"][1][2].name = newpick.name;
							cbs.picksInfoObject["finalfour"][1][2].fullname = newpick.fullname;
							cbs.picksInfoObject["finalfour"][1][2].seed = newpick.seed;
							cbs.picksInfoObject["finalfour"][1][2].abbr = newpick.abbr;
							$("#BracketChampionship li.round1 li.game1 a[data-link='home']").attr("alt",newpick.abbr);
							}
						if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][2][1].name == former.name) // we need to replace the winner also
							{
							cbs.picksInfoObject["finalfour"][2][1].name = newpick.name;
							cbs.picksInfoObject["finalfour"][2][1].fullname = newpick.fullname;
							cbs.picksInfoObject["finalfour"][2][1].seed = newpick.seed;
							cbs.picksInfoObject["finalfour"][2][1].abbr = newpick.abbr;
							$("#BracketChampionship li.round3 li.final a").attr("alt",newpick.abbr);
							}
						}

					}
				if(singleMatch.rnd == 2) // we may need to cascade to final round
					{
					if(singleMatch.game == 1)  // left
						{
						if(!cbs.picksInfoObject["finalfour"]) cbs.picksInfoObject["finalfour"] = {};
						if(!cbs.picksInfoObject["finalfour"][1]) cbs.picksInfoObject["finalfour"][1] = {};
						if(!cbs.picksInfoObject["finalfour"][1][2]) cbs.picksInfoObject["finalfour"][1][1] = {};
						
						cbs.picksInfoObject["finalfour"][1][2].name = newpick.name;
						cbs.picksInfoObject["finalfour"][1][2].fullname = newpick.fullname;
						cbs.picksInfoObject["finalfour"][1][2].seed = newpick.seed;
						cbs.picksInfoObject["finalfour"][1][2].abbr = newpick.abbr;
						$("#BracketChampionship li.round2 li.game1 a[data-link='home']").attr("alt",newpick.abbr);

						if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][2] && cbs.picksInfoObject["finalfour"][2][1] && cbs.picksInfoObject["finalfour"][2][1].name == former.name) // we need to replace the winner also
							{
							cbs.picksInfoObject["finalfour"][2][1].name = newpick.name;
							cbs.picksInfoObject["finalfour"][2][1].fullname = newpick.fullname;
							cbs.picksInfoObject["finalfour"][2][1].seed = newpick.seed;
							cbs.picksInfoObject["finalfour"][2][1].abbr = newpick.abbr;
							$("#BracketChampionship li.round3 li.final a").attr("alt",newpick.abbr);
							}
						}

					if(singleMatch.game == 2)  // right
						{
						if(!cbs.picksInfoObject["finalfour"]) cbs.picksInfoObject["finalfour"] = {};
						if(!cbs.picksInfoObject["finalfour"][1]) cbs.picksInfoObject["finalfour"][1] = {};
						if(!cbs.picksInfoObject["finalfour"][1][1]) cbs.picksInfoObject["finalfour"][1][2] = {};

						cbs.picksInfoObject["finalfour"][1][1].name = newpick.name;
						cbs.picksInfoObject["finalfour"][1][1].fullname = newpick.fullname;
						cbs.picksInfoObject["finalfour"][1][1].seed = newpick.seed;
						cbs.picksInfoObject["finalfour"][1][1].abbr = newpick.abbr;
						$("#BracketChampionship li.round1 li.game1 a[data-link='away']").attr("alt",newpick.abbr);

						if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][2] && cbs.picksInfoObject["finalfour"][2][1] && cbs.picksInfoObject["finalfour"][2][1].name == former.name) // we need to replace the winner also
							{
							cbs.picksInfoObject["finalfour"][2][1].name = newpick.name;
							cbs.picksInfoObject["finalfour"][2][1].fullname = newpick.fullname;
							cbs.picksInfoObject["finalfour"][2][1].seed = newpick.seed;
							cbs.picksInfoObject["finalfour"][2][1].abbr = newpick.abbr;
							$("#BracketChampionship li.round3 li.final a").attr("alt",newpick.abbr);
							}
						}
					}
				if(singleMatch.rnd == 3) // the final deal
					{

					if(!cbs.picksInfoObject["finalfour"]) cbs.picksInfoObject["finalfour"] = {};
					if(!cbs.picksInfoObject["finalfour"][2]) cbs.picksInfoObject["finalfour"][2] = {};
					if(!cbs.picksInfoObject["finalfour"][2][1]) cbs.picksInfoObject["finalfour"][2][1] = {};

					cbs.picksInfoObject["finalfour"][2][1].name = newpick.name;
					cbs.picksInfoObject["finalfour"][2][1].fullname = newpick.fullname;
					cbs.picksInfoObject["finalfour"][2][1].seed = newpick.seed;
					cbs.picksInfoObject["finalfour"][2][1].abbr = newpick.abbr;
					$("#BracketChampionship li.round3 li.final a").attr("alt",newpick.abbr);
					}
				}
			else
				{
	
				for(var rnd2 in cbs.picksInfoObject[singleMatch.region])
					{
					if(String(rnd2).length>1)
						{
						console.log(rnd2);
						console.log(rnd2.substring(5,6));
						rnd3 = String(rnd2.substring(5,6));
						}
					else
						{
						rnd3=rnd2;
						console.log("not oversize",rnd2);
					}
					if(rnd3<(singleMatch.rnd-1) && singleMatch.rnd != 2) continue;
					for(var game in cbs.picksInfoObject[singleMatch.region][rnd3])
	
						{
						if(cbs.picksInfoObject[singleMatch.region][rnd3][game].name == former.name) // adios muchacho
							{
							cbs.picksInfoObject[singleMatch.region][rnd3][game].name = newpick.name;
							cbs.picksInfoObject[singleMatch.region][rnd3][game].fullname = newpick.fullname;
							cbs.picksInfoObject[singleMatch.region][rnd3][game].seed = newpick.seed;
							cbs.picksInfoObject[singleMatch.region][rnd3][game].abbr = newpick.abbr;
							}
						}
					}
				// now cascade final four
				
										
				if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][1] && cbs.picksInfoObject["finalfour"][1][1].name == former.name) // we need to replace the winner also
					{
					cbs.picksInfoObject["finalfour"][1][1].name = newpick.name;
					cbs.picksInfoObject["finalfour"][1][1].fullname = newpick.fullname;
					cbs.picksInfoObject["finalfour"][1][1].seed = newpick.seed;
					cbs.picksInfoObject["finalfour"][1][1].abbr = newpick.abbr;
					$("#BracketChampionship li.round2 li.game1 a[data-link='home']").attr("alt",newpick.abbr);
					}
				if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][1] && cbs.picksInfoObject["finalfour"][1][2].name == former.name) // we need to replace the winner also
					{
					cbs.picksInfoObject["finalfour"][1][2].name = newpick.name;
					cbs.picksInfoObject["finalfour"][1][2].fullname = newpick.fullname;
					cbs.picksInfoObject["finalfour"][1][2].seed = newpick.seed;
					cbs.picksInfoObject["finalfour"][1][2].abbr = newpick.abbr;
					$("#BracketChampionship li.round1 li.game1 a[data-link='away']").attr("alt",newpick.abbr);
					}
				if(cbs.picksInfoObject["finalfour"] && cbs.picksInfoObject["finalfour"][2] && cbs.picksInfoObject["finalfour"][2][1].name == former.name) // we need to replace the winner also
					{
					cbs.picksInfoObject["finalfour"][2][1].name = newpick.name;
					cbs.picksInfoObject["finalfour"][2][1].fullname = newpick.fullname;
					cbs.picksInfoObject["finalfour"][2][1].seed = newpick.seed;
					cbs.picksInfoObject["finalfour"][2][1].abbr = newpick.abbr;
					$("#BracketChampionship li.round3 li.final a").attr("alt",newpick.abbr);			
					}

				}				

			cbs.clearPicksFlag=0;
			cbs.injectPicksPre(cbs.activeRegion);
						
			$("#bracketZoomedPage").css("opacity","1");
			$("#bracketZoomedPage").css("display","");
			cbs.goToPage = "skip";
			$("#goback2").click();
			singleMatch.ready=1;
			return false;

		});

}
