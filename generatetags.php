<?php
	// This is an example file, it doesn't actually generate any useful data
	
	$Tags =
	[
		'Tag #1',
		'Tag #2',
		'Tag #3',
		'Tag #4',
		'Tag #5',
	];
	
	$Games =
	[
		[
			'appid' => 730,
			'name' => 'A game',
			'is_answer' => true,
		],
		[
			'appid' => 570,
			'name' => 'A game',
		],
		[
			'appid' => 440,
			'name' => 'A game',
		],
	];
	
	shuffle( $Games );
	
	$Response =
	[
		'success' => true,
		'tags' => $Tags,
		'games' => $Games
	];
	
	header( 'Content-Type: application/json' );
	
	echo json_encode( $Response );
