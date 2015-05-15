 function Player(){
      var material = new THREE.MeshPhongMaterial({
         ambient  : 0,
         emissive : 0x008080,
         color    : 0x008080,
         specular : 0x001010,
         shininess: 40
      });
      var headMaterial = new THREE.MeshPhongMaterial({
       ambient  : 0,
       emissive : 0x004000,
       color    : 0x004000,
       specular : 0x001000,
       shininess: 10
      });
      var hatMaterial = new THREE.MeshBasicMaterial( { 
        envMap: THREE.ImageUtils.loadTexture( './textures/hat3.jpg', THREE.SphericalReflectionMapping ),
        overdraw: .5 
      });
      var metalMaterial = new THREE.MeshBasicMaterial( { 
        envMap: THREE.ImageUtils.loadTexture( './textures/metal.jpg', THREE.SphericalReflectionMapping ),
        overdraw: .5 
      });
      var wheelMaterial = new THREE.MeshPhongMaterial({
       ambient  : 0,
       emissive : 0x101010,
       color    : 0x101010,
       specular : 0x101010,
       shininess: 10
      });
 


      this.gun = new THREE.Mesh();
      this.gun.position.z = -4;
      //this.gun.rotation.y = Math.PI;

      var cylinder= new THREE.Mesh( new THREE.CylinderGeometry( .1, .1, .5, 32 ), metalMaterial);
      cylinder.rotation.x = Math.PI/2;
      cylinder.position.z = -0.5;
      this.gun.add(cylinder)
      this.cylinder = cylinder;

      var testMaterial = headMaterial.clone();
      color = Math.random() * 0xffffff;
      testMaterial.color.setHex(color);
      testMaterial.emissive.setHex(color);
      var head = new THREE.Mesh( new THREE.SphereGeometry(.3, .5, 32), testMaterial );
      this.gun.add(head);
      this.head = head;

      var body = new THREE.Mesh( new THREE.CylinderGeometry( .07, .07, .5, 32 ), metalMaterial );
      body.position.y = -0.5;
      this.gun.add(body);

      var bar = new THREE.Mesh( new THREE.CylinderGeometry( .07, .07, .5, 32 ), metalMaterial );
      bar.rotation.z = Math.PI/2;
      bar.position.y = -0.5 - 0.25;
      this.gun.add(bar);

      var hat = new THREE.Mesh( new THREE.CylinderGeometry( .1, .5, .1, 32 ), hatMaterial );
      hat.rotation.z = Math.PI/4;
      hat.position.y = 0.1;
      hat.position.x = -0.1;
      this.gun.add(hat);

      var wheelR = new THREE.Mesh( new THREE.CylinderGeometry( .3, .3, .1, 32 ), wheelMaterial );
      wheelR.rotation.z = Math.PI/2;
      wheelR.position.y = -0.5 - 0.25;
      wheelR.position.x = 0.25;
      this.gun.add(wheelR);
      this.isDepth = false;


      var wheelL = new THREE.Mesh( new THREE.CylinderGeometry( .3, .3, .1, 32 ), wheelMaterial );
      wheelL.rotation.z = Math.PI/2;
      wheelL.position.y = -0.5 - 0.25;
      wheelL.position.x = -0.25;
      this.gun.add(wheelL);

      this.depth = function(){
          this.gun.rotation.x = Math.PI/2;
          this.gun.position.y -= 0.5;
          this.isDepth = true;
      }

      this.update = function(move){
          wheelR.rotation.x += move;
          wheelL.rotation.x += move;
      }
      this.getDir = function(){
          var pos = new THREE.Vector3()
          var dir = new THREE.Vector3()
          pos.setFromMatrixPosition(this.gun.matrixWorld);
          dir.setFromMatrixPosition( this.cylinder.matrixWorld );

          dir.x -= pos.x
          dir.y -= pos.y
          dir.z -= pos.z

          dir = dir.normalize();
          return dir
      }
      return this;
 }

