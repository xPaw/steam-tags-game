( function( $, storageDriver )
{
	var KeyPress = function( e )
	{
		if( e.keyCode === 13 )
		{
			ElementContinueButton[ 0 ].click();
		}
	},
	
	ClickGame = function()
	{
		var element = $( this );
		
		SelectAnswer( element.data( 'appid' ), element.data( 'name' ) );
		
		return false;
	},
	
	// We need this so we don't keep showing #tags-window on every continue button press
	ClickNewGame = function( event )
	{
		if( !LoadingData )
		{
			// We don't need the welcome screen anymore
			$( '#welcome-screen' ).remove();
			
			$( '#tags-window' ).show();
			
			$( this ).off( event );
			
			ElementContinueButton = $( '.btn-loadnew' ).on( 'click', ClickContinue );
		}
		
		return ClickContinue();
	},
	
	ClickContinue = function()
	{
		if( !LoadingData )
		{
			ElementTagList.each( function( i, element )
			{
				$( element ).text( NextTags[ i ] );
			} );
			
			ElementGameMessage.hide();
			ElementTagSelection.show();
		}
		
		return false;
	},
	
	LoadTags = function()
	{
		$.ajax( {
			method: 'GET',
			type: 'json',
			cache: false,
			timeout: 20000,
			url: 'generatetags.php',
			success: HandleData,
			error: HandleError
		} );
	},
	
	HandleData = function( data )
	{
		if( data.success !== true )
		{
			return HandleError();
		}
		
		// We have to store tags before user clicks continue button
		NextTags = data.tags;
		
		var game;
		
		ElementGameList.each( function( i, element )
		{
			game = data.games[ i ];
			
			if( !game )
			{
				return;
			}
			
			if( game.is_answer )
			{
				CurrentAnswer = data.games[ i ];
			}
			
			$( element )
				.data( 'appid', game.appid )
				.data( 'name', game.name )
				.find( 'img' )
					.attr( 'alt', game.name )
					.attr( 'src', GetAppImage( game.appid ) );
		} );
		
		LoadingData = false;
		
		ElementContinueButton.removeClass( 'btn-disabled' );
	},
	
	HandleError = function( )
	{
		alert( 'Failed to load next game. Please refresh the page.' );
	},
	
	SelectAnswer = function( appid, name )
	{
		ElementTagSelection.hide();
		
		// Disable continue button
		ElementContinueButton.addClass( 'btn-disabled' );
		
		LoadingData = true;
		
		// Start loading tags in the background
		LoadTags();
		
		ElementAnswerGame
			.attr( 'href', GetAppURL( CurrentAnswer.appid ) )
			.children( 'img' )
				.attr( 'src', GetAppImage( CurrentAnswer.appid ) )
				.attr( 'alt', CurrentAnswer.name )
				.attr( 'title', CurrentAnswer.name + ' on Steam' );
		
		if( appid === 0 )
		{
			//I don't know!
			Losses++;
			CurrentStreak = 0;
			
			ElementAnswerMessage.show();
		}
		else if( appid === CurrentAnswer.appid )
		{
			//Right!
			Wins++;
			CurrentStreak++;
			
			if( CurrentStreak > LongestStreak )
			{
				LongestStreak = CurrentStreak;
			}
			
			ElementWinMessage.show();
		}
		else
		{
			//Wrong!
			Losses++;
			CurrentStreak = 0;
			
			ElementLoseMessage
				.show()
				.find( '.chosen-game' )
					.attr( 'href', GetAppURL( appid ) )
					.children( 'img' )
						.attr( 'src', GetAppImage( appid ) )
						.attr( 'alt', name )
						.attr( 'title', name + ' on Steam' );
		}
		
		UpdateStats();
		UpdateStorage();
	},
	
	ResetStats = function()
	{
		Wins =
		Losses =
		CurrentStreak =
		LongestStreak = 0;
		
		UpdateStats();
		
		if( storageDriver )
		{
			storageDriver.clear();
		}
	},
	
	UpdateStats = function()
	{
		var total = Wins + Losses;
		
		$( '#stat-wins' ).text( Wins );
		$( '#stat-total' ).text( total );
		$( '#stat-streak' ).text( CurrentStreak );
		$( '#stat-streak-best' ).text( LongestStreak );
		
		if( !total )
		{
			$( '#stat-accuracy' ).text( 0 );
		}
		else
		{
			$( '#stat-accuracy' ).text( Math.round( Wins / total * 10000 ) / 100 );
		}
	},
	
	UpdateStorage = function()
	{
		StorageSet( 'tag_wins', Wins );
		StorageSet( 'tag_losses', Losses );
		StorageSet( 'tag_streak', LongestStreak );
		StorageSet( 'tag_streak_current', CurrentStreak );
	},
	
	StorageSet = function( key, value )
	{
		if( storageDriver )
		{
			storageDriver.setItem( key, value );
		}
	},
	
	StorageGet = function( key )
	{
		if( storageDriver )
		{
			var result = storageDriver.getItem( key );
			
			if( result )
			{
				return parseInt( result, 10 );
			}
		}
		
		return 0;
	},
	
	GetAppURL = function( appid )
	{
		return '//store.steampowered.com/app/' + appid + '/';
	},
	
	GetAppImage = function( appid )
	{
		return '//cdn.steampowered.com/v/gfx/apps/' + appid + '/header' + ( IsRetina ? '' : '_292x136' ) + '.jpg';
	},
	
	IsRetina = ( function( w )
	{
		if( w.devicePixelRatio > 1 )
		{
			return true;
		}
		
		if( w.matchMedia && w.matchMedia( '(-webkit-min-device-pixel-ratio: 1.5),(min--moz-device-pixel-ratio: 1.5),(-o-min-device-pixel-ratio: 3/2),(min-resolution: 1.5dppx)' ).matches )
		{
			return true;
		}
		
		return false;
	}( window ) ),
	
	CurrentAnswer,
	LoadingData = true,
	NextTags,
	LongestStreak = StorageGet( 'tag_streak' ),
	CurrentStreak = StorageGet( 'tag_streak_current' ),
	Wins          = StorageGet( 'tag_wins' ),
	Losses        = StorageGet( 'tag_losses' ),
	
	ElementContinueButton   = $( '#play-now' ).on( 'click', ClickNewGame ),
	ElementTagSelection     = $( '#tags-selection' ).on( 'click', '.game', ClickGame ),
	ElementGameMessage      = $( '.game-message' ),
	ElementWinMessage       = $( '#win-message' ),
	ElementLoseMessage      = $( '#lose-message' ),
	ElementAnswerMessage    = $( '#answer-message' ),
	ElementTagList          = $( '#tag-list' ).children(),
	ElementGameList         = $( '#game-list' ).children(),
	ElementAnswerGame       = $( '.answer-game');
	
	$( '#reset-stats' ).on( 'click', ResetStats );
	
	$( document ).on( 'keypress', KeyPress );
	
	UpdateStats();
	LoadTags();
}( jQuery, localStorage ) );
