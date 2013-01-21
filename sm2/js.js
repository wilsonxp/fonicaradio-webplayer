soundManager.flashVersion = 9;
soundManager.wmode = 'transparent'; 
soundManager.allowPolling = false; 
soundManager.useFastPolling = false;
soundManager.useHighPerformance = false;
soundManager.debugMode = false;
soundManager.useFlashBlock = true;
soundManager.url = 'sm2/sm_swf/';
var streamer = 'rtmp://174.36.251.141:80/8088';
var file = 'default.stream';
var radiofriendfeedname = 'beatpopcl'
var songurl = 'http://friendfeed-api.com/v2/updates/feed/' + radiofriendfeedname + '?timeout=360&callback=?';


//var streamer = 'rtmp://65.60.20.210:1935/shoutcast';
//var file = 'http://83.84.235.223:9002';

var fonicaplayer = {
	reproduciendo: 0,
	volume: 70,
	soundId: 'fonicaradio',
	streamer: streamer,
	file: file,
	play: function(){
		this.createSound();
		soundManager.play(this.soundId);
		this.reproduciendo = 1;
		$(document).trigger("playing");
	},
	stop2: function()
	{
		soundManager.stop(this.soundId);
		soundManager.destroySound(this.soundId);
		this.reproduciendo = 0;
		$(document).trigger("stopping");
	},
	vol: function(v)
	{
		if(v > 100) v = 100;
		if(v < 0) v = 0;
		
		try{	
			soundManager.setVolume(this.soundId,v);
		}catch(e){};
		this.volume = v;
	},
	createSound: function(){
		if(soundManager.getSoundById(this.soundId) != null){
			soundManager.destroySound(this.soundId);
		}
		_fonicaplayer = this;
		soundManager.createSound(
			{
				id: _fonicaplayer.soundId,
				serverURL: _fonicaplayer.streamer,
				url: _fonicaplayer.file,
				volume: _fonicaplayer.volume
			}
		)
	},
	init: function()
	{
		this.play();
	}
}
var fonicainterfaz = {
	artista: '',
	cancion: '',
	cover: '',
	cover_bg: '',
	pagina: 'www.fonicaradio.com',
	twitter: 'fonicacl',
	setVolumeSlide: function()
	{
		if($.cookie('vol')){
			fonicaplayer.volume = $.cookie('vol')
		}
			
		$( "#volume" ).slider({
			value: fonicaplayer.volume,
			orientation: "vertical",
			range: "min",
			min: 0,
			max: 100,
			animate: true,
			change: function(event, ui) {
				fonicaplayer.vol(ui.value);
				$.cookie('vol',ui.value);
				}
		});
	},
	setPlayerHandlers: function()
	{
		$(document).bind("playing",function(){
			$("#bpause").fadeTo("slow","0.95");
			$("#bplay").fadeOut("slow");
			
		});
		$(document).bind("stopping",function(){
			$("#bplay").fadeTo("slow","0.95");	
			$("#bpause").fadeOut("slow");
					
		});	
		$("#reproduccion #bpause").click(function(){
			fonicaplayer.stop2();
		});
		$("#reproduccion #bplay").click(function(){
			fonicaplayer.play();
		});
		
		$("#twitter-share-cancion, #fb-share-cancion").fadeTo("slow",0.5);
		$("#twitter-share-cancion, #fb-share-cancion").hover(function() {
		  $(this).stop().fadeTo("slow",1);
		}, function() {
		  $(this).stop().fadeTo("slow",0.5);
		});
		
		
	},
	setTitleDataHandler: function()
	{
		$(document).bind("setTitleData",function(event,artist,title,lastfmimg,lastfmimgbg){
				$("#cover img").fadeOut("500",function(){
					if(lastfmimg!=="no_image"){
						var img = new Image();
						$(img).load(function () {
							$(this).hide();
							$(this).fadeIn();
							$("#cover img").attr("src", lastfmimg).fadeIn("500");
						}).error(function () {
							// notify the user that the image could not be loaded
						}).attr('src', lastfmimg);
					}
				});
				$("#fonicaradio #fonicaradio_bg_cover img").fadeOut("500",function(){
					if(lastfmimgbg!=="no_image"){
						var img2 = new Image();
						$(img2).load(function () {
							$(this).hide();
							$("#fonicaradio #fonicaradio_bg_cover img").attr('src', lastfmimgbg).fadeIn("500");
						}).error(function () {
							// notify the user that the image could not be loaded
						}).attr('src', lastfmimgbg);
					}
				});
				title = title.toLowerCase();
				$("#artista").fadeOut("500",function(){$(this).html(artist).fadeIn("500")});
				$("#cancion").fadeOut("500",function(){$(this).html(title).fadeIn("500")});
				
				fonicainterfaz.setTwitterShareSong();
				fonicainterfaz.setFbShareSong();
				
		});
	},
	startTitleDataHandler: function()
	{
//		_fon = this;
//		this.refreshTitleData();
//		$(document).everyTime("10s",function(){ _fon.refreshTitleData(); });

		_fon = this;
		$.getJSON("http://friendfeed-api.com/v2/feed/" + radiofriendfeedname +"?num=1&callback=?",
			function(data) {
				try{
					song = data.entries[0].body.replace(/\\/g, '');
					song = song.split("|");
					song[0] = song[0].toUpperCase();
					song[1] = song[1].toUpperCase();
					if(song[0] !== _fon.artista || song[1] !== _fon.cancion){
						_fon.artista = song[0];
						_fon.cancion = song[1];
						_fon.refreshLastfmData();
						
					}
				}catch(ex){//si existe algun error arriba
					_fon.artista = fonicainterfaz.pagina;
					_fon.cancion = "Escuchas";
					_fon.refreshLastfmData();
				}
					
		})
		.error(function() {
			_fon.startTitleDataHandler();	
		})
		.complete(function() { 
			t = $(window).load(function () {//evita icono loading al pasar al feed live
				//setTimeout(function() {
					_fon.refreshTitleData();
					//}, 4000); 
			});
		});
	},
	refreshTitleData: function(cursor)
	{
		_fon = this;
		var cur=0;
		
		if(cursor){
			songurl = 'http://friendfeed-api.com/v2/updates/feed/' + radiofriendfeedname + '?timeout=360&callback=?';
			songurl += "&cursor=" + cursor;
		}
		
		$.getJSON(songurl,
			function(data) {
				try{
					cur = data.realtime.cursor;
					song = data.entries[0].body.replace(/\\/g, '');
					song = song.split("|");
					song[0] = song[0].toUpperCase();
					song[1] = song[1].toUpperCase();
					if(song[0] !== _fon.artista || song[1] !== _fon.cancion){
						_fon.artista = song[0];
						_fon.cancion = song[1];
						_fon.refreshLastfmData();	
					}
				}catch(ex){
						
				}	
			})
			.error(function() {
				_fon.refreshTitleData();	
			})
			.complete(function() { 
				setTimeout(function() {_fon.refreshTitleData(cur)}, 1000); 
			});
		
	},
	refreshLastfmData: function()
	{
		_foni = this;
		var artista = (fonicainterfaz.artista).split(" Feat ")[0];
		artista = artista.split(" feat ")[0];							
		artista = artista.split(" FEAT ")[0];							
		artista = artista.split(" FEAT. ")[0];							
		artista = artista.split(" Ft ")[0];
		artista = artista.split(" Ft. ")[0];
		artista = artista.split(" ft ")[0];
		artista = artista.split(" ft. ")[0];
		artista = artista.split(" feat. ")[0];
		artista = artista.split(" FT. ")[0];
		artista = artista.split(" Feat. ")[0];
		
		var cancion = (fonicainterfaz.cancion).split(" (")[0];
		cancion = cancion.split(" [")[0];
		
		
	
		$.getJSON("http://ws.audioscrobbler.com/2.0/?callback=?",
			{ 
			method: "artist.getImages",
			limit: 1,
			order: "popularity",
			autocorrect: 1,
			artist: artista,
			api_key: "165e281681bab776c56d571ea7fc03c2",
			format: "json"
			}, function(data){
				try {
					_foni.cover = data.images.image.sizes.size['2']['#text'];
					_foni.cover_bg = data.images.image.sizes.size['5']['#text'];
					
				}catch(ex){
					_foni.cover = 'no_image';
					_foni.cover_bg = 'no_image';
					
				}
				$(document).trigger("setTitleData",[artista,cancion,_foni.cover,_foni.cover_bg]);
			});
	},
	setPopup: function()
	{
		$("#twitter-share-cancion").click(function () {
			n=window.open(this.href, 'Popup', "height=460,width=540,scrollTo,resizable=1,scrollbars=0,location=1");
			return false;
		});
		$("#fb-share-cancion").click(function () {
			n=window.open(this.href, 'Popup', "height=460,width=540,scrollTo,resizable=1,scrollbars=0,location=1");
			return false;
		});
		
	},
	setTwitterShareSong: function()
	{
		$('#twitter-share-cancion').attr('href', 'http://twitter.com/share?text=Escuchando%20'+ fonicainterfaz.cancion +' de '+ fonicainterfaz.artista +' en&url=http%3A%2F%2F'+ fonicainterfaz.pagina +'%2F&via='+ fonicainterfaz.twitter );
	},
	setFbShareSong: function()
	{
		$('#fb-share-cancion').attr('href', 'http://www.facebook.com/share.php?s=100&p[url]=http://'+ fonicainterfaz.pagina +'&p[images][0]='+ fonicainterfaz.cover +'&p[title]=Escuchando '+ fonicainterfaz.cancion +' de '+ fonicainterfaz.artista + ' en ' + fonicainterfaz.pagina + '&p[summary]=Escuchando '+ fonicainterfaz.cancion +' de '+ fonicainterfaz.artista + ' en ' + fonicainterfaz.pagina);
	},
	
	
	
	setInterfazcentro: function()
	{
		
			//var height = $(document).height();
//			var heightdiv = $("#fonicaradio").height();
//			$("#fonicaradio").css({"top" : height/2 - heightdiv/2 - 25, "margin-top" : "0"});
//		
//		$(window).resize(function() {
//			var height = $(document).height();
//			var heightdiv = $("#fonicaradio").height();
//			$("#fonicaradio").css({"top" : height/2 - heightdiv/2 - 25, "margin-top" : "0"});
//		});	
	},
	init: function(){
		this.setVolumeSlide();
		this.setInterfazcentro();
		this.setPlayerHandlers();
		this.setTitleDataHandler();
		this.setPopup();
		this.startTitleDataHandler();
		soundManager.onready(function(a){ if(soundManager.supported()){fonicaplayer.init();}  })
	}
}





$(document).ready(function(){
	fonicainterfaz.init();
});
