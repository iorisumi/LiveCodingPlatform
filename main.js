var main = function () {
    var scene = new THREE.Scene();  //シーンを作成
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);  //カメラを作成
    const renderer = new THREE.WebGLRenderer(); //レンダラーを作成

    const controls = new THREE.PointerLockControls(camera, renderer.domElement);  //カメラにPointerLockControls機能を付与
    const boxGeometry = new THREE.BoxGeometry(100, 100, 100); //boxの形状データ
    var boxMaterial;
    var box1;
    var box2;
    var box3;


    const skyBoxGeometry = new THREE.BoxGeometry(5000, 5000, 5000); //boxの形状データ
    var skyBox;
    var skyBoxMaterial;

    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let prevTime = performance.now(); //1フレーム前の時刻を記憶
    let velocity = new THREE.Vector3();
    let direction = new THREE.Vector3();

    var textarea = document.getElementById("textarea3");
    var textContents = textarea.value;

    const ctx = document.createElement('canvas').getContext('2d');
    //ここでbodyに追加しなければ表示されない
    //document.body.appendChild(ctx.canvas);
    var fontSize = 28;
    ctx.font = "30px 'メイリオ'";
    ctx.canvas.width = 256 * 8;
    ctx.canvas.height = 256 * 8;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    var maxRow = Math.ceil(ctx.canvas.width / fontSize);

    var cursorPosition = 0.;

    // let Sprite = new THREE.TextSprite({
    //     textSize: 10,
    //     texture: {
    //         text: 'Hello World!',
    //         fontFamily: 'Arial, Helvetica, sans-serif',
    //     },
    //     material: {color: 0xffbbff},
    // });

    var texture;

    var move_Mode = 0;

    //コンパイルチェック用
    //var gl;

    //var stats;


    function init() {    //初期化用関数
        //VR化
        document.body.appendChild( VRButton.createButton( renderer ) );
        renderer.vr.enabled = true;

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap;
        document.body.appendChild(renderer.domElement); //canvas要素をbodyタグに追加

        //webglからも触れるように
        gl = renderer.getContext("experimental-webgl");

        textarea.value =  document.getElementById('fragment_shader').textContent;

        skyBoxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { type: "f", value: 0.0 },
                // /cp :{type: "v3" ,value: new THREE.Vector3(0.,0.,0.)}
                //resolution: { type: "v2", value: new THREE.Vector2(512.0, 512.0) }
            },
            vertexShader: document.getElementById('vertex_shader').textContent,
            fragmentShader: textarea.value,
            side: THREE.DoubleSide,
        });

       // shaderUpdate();

        skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);

        texture = new THREE.CanvasTexture(ctx.canvas);

        boxMaterial = new THREE.MeshBasicMaterial({
            map: texture,
        });

        //boxMaterial = new THREE.MeshBasicMaterial({color: 0x6699FF});

        box1 = new THREE.Mesh(boxGeometry, boxMaterial);
        box2 = new THREE.Mesh(boxGeometry, boxMaterial);
        box3 = new THREE.Mesh(boxGeometry, boxMaterial);


        camera.position.set(0, 20, 150);
        box1.position.set(0, 0, 0);
        box2.position.set(200, 0, 500);
        box3.position.set(-200, 0, 500);
        scene.add(box1);
        scene.add(box2);
        scene.add(box3);
        scene.add(skyBox);
        
       // scene.add(Sprite);
        scene.add(controls.getObject());

        
        textarea.focus();
        textContents = textarea.value
        textUpdate();
        renderer.domElement.addEventListener('click', function () {
            controls.lock();
        });
    }

    function textUpdate(t) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "30px 'メイリオ'";
        //入力文字を1文字毎に配列化
        var aryText = textContents.split('');

        //出力用の配列を用意
        var aryRow = [];
        aryRow[0] = '';
        var row_cnt = 0;

        for (var i = 0; i < aryText.length; i++) {
            var text = aryText[i];
            if(cursorPosition == i)
            {
                row_cnt++;
                text = (t > 0.)?'|':' ';
                aryRow[row_cnt] += text;
            }
            if (text == "\n") {
                row_cnt++;
                aryRow[row_cnt] = '';
                text = '';
            }
            aryRow[row_cnt] += text;
        }

        //文字の表示　y軸とx軸をループする
        for (var i = 0; i < aryRow.length; i++) {
            aryStr = aryRow[i].split('');
            for (var j = 0; j < aryStr.length; j++) {
                ctx.fillText(aryStr[j], (j * fontSize), (i * fontSize));
            }
        }
    }

    // function saveImage() {
    //     var base64 = ctx.canvas.toDataURL("image/jpeg");
    //     document.getElementById("download").href = base64;
    // }

    function setMaterial(time) {
        skyBoxMaterial.uniforms.time.value = time * 0.001;
        // var vector = camera.position.clone();
        // vector.applyMatrix( camera.matrixWorld );
        // skyBoxMaterial.uniforms.cp.value = vector;
        //skyBoxMaterial.uniforms.cp.value = camera.position;
    }

    function shaderUpdate()
    {
        var shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader,document.getElementById('fragment_shader').textContent);
        // if(gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        // {
        //     console.log("true");
        // }else{
        //     console.log("false");
        //   //  alert(gl.getShaderInfoLog(shader));
        // }

        //コンパイル通った時の処理
        scene.remove(skyBox);
        skyBoxMaterial.dispose();

        skyBoxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { type: "f", value: 0.0 },
                //cp :{type: "v3" ,value: new THREE.Vector3(0.,0.,0.)}
                //resolution: { type: "v2", value: new THREE.Vector2(512.0, 512.0) }
            },
            vertexShader: document.getElementById('vertex_shader').textContent,
            fragmentShader: textarea.value,
            side: THREE.DoubleSide,
        });
        skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
        scene.add(skyBox);
        
    }

    // function caret() {
    //     //node.focus(); 
    //     /* without node.focus() IE will returns -1 when focus is not on node */
    //     if(textarea.selectionStart) return  textarea.selectionStart;
    //     else if(!document.selection) return 0;
    //     var c		= "\001";
    //     var sel	= document.selection.createRange();
    //     var dul	= sel.duplicate();
    //     var len	= 0;
    //     dul.moveToElementText(textarea);
    //     sel.text	= c;
    //     len		= (dul.text.indexOf(c));
    //     sel.moveStart('character',-1);
    //     sel.text	= "";
    //    // return len;

    //     cursorPosition = len;
    // }

    function animate(timestamp) {
      //  caret();
        if(move_Mode){
            move();
        }
        var t = Math.sin( (timestamp * Math.acos(-1)) / 1.);
        textUpdate(t);

        texture.needsUpdate = true;
        setMaterial(timestamp);
        renderer.render(scene, camera);
       // requestAnimationFrame(animate); //毎フレーム呼び出すことで描画
        //VR
        renderer.setAnimationLoop(animate);
    }

    function move() {  //カメラの移動を制御する関数.毎フレーム呼ばれる
        let time = performance.now();
        if (controls.isLocked === true) { //マウスのポインタがロックされているときのみ有効
            let delta = (time - prevTime) / 1000;

            //速度を減衰させる
            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            //進行方向のベクトルを設定
            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize();

            if (moveForward || moveBackward) velocity.z -= direction.z * 1000.0 * delta;
            if (moveLeft || moveRight) velocity.x -= direction.x * 1000.0 * delta;

            controls.moveRight(- velocity.x * delta);
            controls.moveForward(- velocity.z * delta);

        }
        prevTime = time;
    }

    
    let onKeyDown = function (event) {  //キーボード押下時の処理
        //console.log(event.keyCode);
        if(event.keyCode == 18){
            move_Mode = 1 - move_Mode;
            console.log(move_Mode)
        }
        if(0 == move_Mode)
        {
            textarea.focus();
            
        }else{
            textarea.blur();
            switch ( event.keyCode ) {
                case 87: // w
                  moveForward = true;
                  break;
                case 65: // a
                  moveLeft = true;
                  break;
                case 83: // s
                  moveBackward = true;
                  break;
                case 68: // d
                  moveRight = true;
                  break;
              }
        }
        console.log(cursorPosition);
    };


    let onKeyUp = function ( event ) {  //キーボードから離れたとき
        if(1==move_Mode){
            switch ( event.keyCode ) {
                case 87: // w
                    moveForward = false;
                    break;
                case 65: // a
                    moveLeft = false;
                    break;
                case 83: // s
                    moveBackward = false;
                    break;
                case 68: // d
                    moveRight = false;
                    break;
                }
        }else{
            textContents = textarea.value
           // textUpdate();
            console.log(textContents);
            shaderUpdate();
            setMaterial();
        }
      };


    init();
    animate();

    // canvasInput();

    document.body.addEventListener('keydown', onKeyDown, false);  //キーボードに関するイベントリスナ登録
    document.body.addEventListener('keyup', onKeyUp, false);

    //入力時にイベントを発火
    // if (input_dom != null) {
    //     input_dom.addEventListener('input', function (e) {
    //         canvasInput();
    //     });
    // }
}