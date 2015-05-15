function Terrain(){
    var data = generateHeight( 1024, 1024 );
    var texture = new THREE.Texture( generateTexture( data, 1024, 1024 ) );
    texture.needsUpdate = true;
    
    var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
    
    var quality = 16, step = 1024 / quality;
    
    var geometry = new THREE.PlaneGeometry( 1024, 1024, quality, quality);
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    
    //var maxZ = 0;
    for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
    
    	var x = i % quality, y = Math.floor( i / quality );
    	geometry.vertices[ i ].y = data[ ( x * step ) + ( y * step ) * 1024 ] * 2 - 128;
        console.log(geometry.vertices[ i ].x)
        //maxX = Math.max(maxX, geometry.vertices[ i ].x);
    }
    //console.log("maxX:" + maxX)
    
    var mesh = new THREE.Mesh( geometry, material );
    this.mesh = mesh;
    this.data = data;
    this.locationToHeight = function(x, y){
        x = Math.round(x);
        y = Math.round(y);
        return this.data[ x + y * 1024 ] * 2 - 128;
    }
    return this;
}

function generateHeight( width, height ) {

	var data = new Uint8Array( width * height ), perlin = new ImprovedNoise(),
	size = width * height, quality = 2, z = Math.random() * 100;

	for ( var j = 0; j < 4; j ++ ) {

		quality *= 4;

		for ( var i = 0; i < size; i ++ ) {

			var x = i % width, y = ~~ ( i / width );
			data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * 0.5 ) * quality + 10;

		}

	}

	return data;

}

function generateTexture( data, width, height ) {

	var canvas, context, image, imageData,
	level, diff, vector3, sun, shade;

	vector3 = new THREE.Vector3( 0, 0, 0 );

	sun = new THREE.Vector3( 1, 1, 1 );
	sun.normalize();

	canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;

	context = canvas.getContext( '2d' );
	context.fillStyle = '#000';
	context.fillRect( 0, 0, width, height );

	image = context.getImageData( 0, 0, width, height );
	imageData = image.data;

	for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++  ) {

		vector3.x = data[ j - 1 ] - data[ j + 1 ];
		vector3.y = 2;
		vector3.z = data[ j - width ] - data[ j + width ];
		vector3.normalize();

		shade = vector3.dot( sun );

		imageData[ i ] = ( 96 + shade * 128 ) * ( data[ j ] * 0.007 );
		imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( data[ j ] * 0.007 );
		imageData[ i + 2 ] = ( shade * 96 ) * ( data[ j ] * 0.007 );

	}

	context.putImageData( image, 0, 0 );

	return canvas;

}
