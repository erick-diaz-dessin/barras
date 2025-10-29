const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0); // Fondo claro tipo SolidWorks
      let frustumSize = 10;
      const aspect = window.innerWidth / window.innerHeight;

      const camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
      );
      camera.position.set(0, 0, 100);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      const container = document.getElementById('visor-3d');
      const visorWidth = container.clientWidth;
      const visorHeight = container.clientHeight;
      renderer.setSize(visorWidth, visorHeight);
      document.getElementById('visor-3d').appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = true;
      controls.enableRotate = true;
      controls.enablePan = true;

      // Luces tipo SolidWorks
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 10);
      scene.add(directionalLight);

      // Grupo para barras + líneas
      let barrasGroup = new THREE.Group();
      scene.add(barrasGroup);
      let textoGroup = new THREE.Group();
      scene.add(textoGroup); // o scene.add(textoGroup) si prefieres separarlos

      // Materiales globales para reutilizar
      const material = new THREE.MeshStandardMaterial({
        color: 0xE6E6E6,
        metalness: 0.4,
        roughness: 0.3,
      });
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

      // Actualizar cámara si cambias frustumSize o aspecto
      function updateCamera(distancia) {
        document.getElementById('visor-3d').style.display = 'block';

        // Después de mostrarlo, actualiza el tamaño del renderer
        const container = document.getElementById('visor-3d');
        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;

        if (distancia/15 > camera.aspect) {
          frustumSize = distancia;
          camera.left = -frustumSize / 2;
          camera.right = frustumSize / 2;
          camera.top = frustumSize / (2 * camera.aspect);
          camera.bottom = -frustumSize / (2 * camera.aspect);
        } else {
          frustumSize = distancia;
          camera.left = -frustumSize * camera.aspect/ 2;
          camera.right = frustumSize * camera.aspect/ 2;
          camera.top = frustumSize / 2;
          camera.bottom = -frustumSize / 2;
        }
        
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);

      }

      let textPosition = {};
      let barrasInvertidas = false;
      let zero = 0;

      // Función para limpiar barras anteriores y crear nuevas
      function iniciarThreeJS(centro, espesor) {
        // Elimina barras antiguas
        while (barrasGroup.children.length > 0) {
          const obj = barrasGroup.children.pop();
          obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
          barrasGroup.remove(obj);
        }

        let anguloBarandal = Math.abs(document.getElementById("num4").value.trim());
        let anguloBarandalRad = anguloBarandal * (Math.PI / 180) - Math.PI / 2;
        let geometry;

        let largoBarandal = centro[centro.length - 1] - centro[0] + espesor; 
        let geometryHorizontal;
        let posHSup;

        zero = -largoBarandal / 2 + espesor;

        if (anguloBarandal !== 0) {
          const shape = new THREE.Shape();
          const base = espesor;
          const altura = 10;
          const dx = Math.tan(anguloBarandalRad) * altura;
          posHSup = -dx + espesor / 2;

          shape.moveTo(- base / 2, - altura / 2);
          shape.lineTo(base / 2, - altura / 2);
          shape.lineTo(base / 2 - dx, altura / 2);
          shape.lineTo(-dx - base / 2, altura / 2);
          shape.lineTo(-base / 2, - altura / 2);

          const extrudeSettings = {
            steps: 1,
            depth: 1,
            bevelEnabled: false,
          };

          geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          geometry.translate(0, 0, -0.5);

          const shapeH = new THREE.Shape();
          const baseH = largoBarandal;
          const alturaH = espesor;
          const dxH = Math.tan(anguloBarandalRad) * espesor;

          shapeH.moveTo(- (baseH + espesor)  / 2, - alturaH / 2);
          shapeH.lineTo((baseH - espesor) / 2, - alturaH / 2);
          shapeH.lineTo((baseH - espesor) / 2 - dxH, alturaH / 2);
          shapeH.lineTo(-dxH - (baseH + espesor) / 2, alturaH / 2);
          shapeH.lineTo(-(baseH + espesor) / 2, - alturaH / 2);

          const extrudeSettingsH = {
            steps: 1,
            depth: 1,
            bevelEnabled: false,
          };

          geometryHorizontal = new THREE.ExtrudeGeometry(shapeH, extrudeSettings);
          geometryHorizontal.translate(0, 0, -0.5);
        } else {
          geometry = new THREE.BoxGeometry(espesor, 10, 1);
          geometryHorizontal = new THREE.BoxGeometry(largoBarandal, espesor, 1); // larga y delgada

        }

        centro.forEach(barra => {
          const posX = barra;
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(posX, 0, 0); // sin rotación
          barrasGroup.add(mesh);
          const edges = new THREE.EdgesGeometry(geometry);
          const line = new THREE.LineSegments(edges, lineMaterial);
          line.position.copy(mesh.position);
          barrasGroup.add(line);
        });

       
        const barraSuperior = new THREE.Mesh(geometryHorizontal, material);
        if (anguloBarandal !== 0) {
          barraSuperior.position.set(posHSup, 5 + espesor / 2, 0); // altura = mitad de 10
        } else {
          barraSuperior.position.set(0, 5 + espesor / 2, 0); // altura = mitad de 10
        }
        barrasGroup.add(barraSuperior);
        // Líneas negras
        const edgesSup = new THREE.EdgesGeometry(geometryHorizontal);
        const lineSup = new THREE.LineSegments(edgesSup, lineMaterial);
        lineSup.position.copy(barraSuperior.position);
        barrasGroup.add(lineSup);

        const barraInferior = new THREE.Mesh(geometryHorizontal, material);
        barraInferior.position.set(0, - 5 - espesor / 2, 0); // altura = mitad de 10
        barrasGroup.add(barraInferior);
        // Líneas negras
        const edgesInf = new THREE.EdgesGeometry(geometryHorizontal);
        const lineInf = new THREE.LineSegments(edgesInf, lineMaterial);
        lineInf.position.copy(barraInferior.position);
        barrasGroup.add(lineInf);

        textPosition = getPosiciones();
        dibujarTexto();
        
      }

      function dibujarTexto() {
        // --- Limpiar textos previos ---
        while (textoGroup.children.length > 0) {
          const obj = textoGroup.children.pop();
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
          textoGroup.remove(obj);
        }

        // --- Selección del lado ---
        const ladoSeleccionado = document.querySelector('input[name="lado"]:checked').value;
        const textPos = textPosition[ladoSeleccionado].pos;
        const posicionLado = textPosition[ladoSeleccionado].text;

        // --- Usar fuente ya cargada desde la variable helvetiker ---
        const font = new THREE.Font(helvetiker);

        for (let i = 0; i < textPos.length; i++) {
          const texto = posicionLado[i][posicionLado[i].length - 1].toString();
          const partes = texto.trim().split(' ');

          // Texto principal
          const geometry = new TextGeometry(partes[0], { font, size: 0.5, height: 0.1, depth: 0.1 });
          const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(textPos[i] - 0.5, -8, 0.5);
          textoGroup.add(mesh);

          // Fracción (numerador/denominador)
          if (partes.length > 1) {
            const [num, den] = partes[1].trim().split('/');
            const up = new THREE.Mesh(new TextGeometry(num, { font, size: 0.3, height: 0.1, depth: 0.1 }), material);
            up.position.set(textPos[i] + 0.5 * (partes[0].length - 1), -7.5, 0.5);
            textoGroup.add(up);

            const down = new THREE.Mesh(new TextGeometry(den, { font, size: 0.3, height: 0.1, depth: 0.1 }), material);
            down.position.set(textPos[i] + 0.5 * (partes[0].length - 1), -8, 0.5);
            textoGroup.add(down);
          }

          // Línea punteada
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(textPos[i], -6.5, 0.5),
              new THREE.Vector3(textPos[i], -4, 0.5)
            ]),
            new THREE.LineDashedMaterial({ color: 0xff0000, dashSize: 0.5, gapSize: 0.2 })
          );
          line.computeLineDistances();
          textoGroup.add(line);
        }

        // --- Agregar "0" ---
        const geometry = new TextGeometry("0", { font, size: 0.5, height: 0.1, depth: 0.1 });
        const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(zero - 0.2, -8, 0.5);
        textoGroup.add(mesh);

        // Línea de "0"
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(zero, -6.5, 0.5),
            new THREE.Vector3(zero, -4, 0.5)
          ]),
          new THREE.LineDashedMaterial({ color: 0xff0000, dashSize: 0.5, gapSize: 0.2 })
        );
        line.computeLineDistances();
        textoGroup.add(line);
      }

      function reversePositionText() {
        reversePosiciones();
        // Invertir los textos
        for (const lado in textPosition) {
          textPosition[lado].text.reverse();
        }
       
        const temp = textPosition.izquierda.text;
        textPosition.izquierda.text = textPosition.derecha.text;
        textPosition.derecha.text = temp;
        
        zero = -zero;
        
        updateTable();
      }        

      function rotarBarras() {
        barrasInvertidas = !barrasInvertidas;
        barrasGroup.rotation.y = barrasInvertidas ? Math.PI : 0;
      }

      // Animación (única vez)
      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      window.iniciarThreeJS = iniciarThreeJS;
      window.updateCamera = updateCamera;
      window.dibujarTexto = dibujarTexto;
      window.reversePositionText = reversePositionText;
      window.rotarBarras = rotarBarras;