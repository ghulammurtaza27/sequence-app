'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default function ModelViewer({ modelFile, onPartSelect }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const meshRef = useRef(null)
  const animationFrameRef = useRef(null)

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (meshRef.current) {
      if (meshRef.current.geometry) {
        meshRef.current.geometry.dispose()
      }
      if (meshRef.current.material) {
        meshRef.current.material.dispose()
      }
      meshRef.current = null
    }

    if (sceneRef.current) {
      while(sceneRef.current.children.length > 0){ 
        const object = sceneRef.current.children[0]
        if (object.geometry) object.geometry.dispose()
        if (object.material) object.material.dispose()
        sceneRef.current.remove(object)
      }
      sceneRef.current = null
    }

    if (controlsRef.current) {
      controlsRef.current.dispose()
      controlsRef.current = null
    }

    if (rendererRef.current) {
      rendererRef.current.dispose()
      rendererRef.current = null
    }

    // Clear any existing canvas
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }
    }
  }

  const convertStepToStl = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('https://sequence-app-production.up.railway.app/api/convert-step', {
            method: 'POST',
            body: formData,
            mode: 'cors',
            credentials: 'omit',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error('Failed to convert STEP file');
        }

        const stlBlob = await response.blob();
        return new File([stlBlob], 'converted.stl', { type: 'model/stl' });
    } catch (error) {
        console.error('Error converting STEP file:', error);
        throw error;
    }
  };

  useEffect(() => {
    if (!containerRef.current || !modelFile) return;

    const loadModelFile = async () => {
      setLoading(true);
      setError(null);

      try {
        let fileToLoad = modelFile;
        
        // Check if it's a STEP file and convert if necessary
        if (modelFile.name.toLowerCase().endsWith('.step') || 
            modelFile.name.toLowerCase().endsWith('.stp')) {
          try {
            fileToLoad = await convertStepToStl(modelFile);
          } catch (error) {
            throw new Error('Failed to convert STEP file: ' + error.message);
          }
        }

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0xffffff);

        const camera = new THREE.PerspectiveCamera(
          75,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.01,
          2000
        );
        cameraRef.current = camera;
        camera.position.set(0, 0, 10);

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          preserveDrawingBuffer: true
        });
        rendererRef.current = renderer;
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const loader = new STLLoader();
        const reader = new FileReader();

        reader.onload = function(e) {
          try {
            const geometry = loader.parse(e.target.result);
            const material = new THREE.MeshPhongMaterial({
              color: 0x808080,
              specular: 0x111111,
              shininess: 200
            });

            const mesh = new THREE.Mesh(geometry, material);
            
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox;
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);

            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxDim;
            mesh.scale.set(scale, scale, scale);

            scene.add(mesh);

            camera.position.set(5, 5, 5);
            camera.lookAt(0, 0, 0);
            controls.update();

            function animate() {
              requestAnimationFrame(animate);
              controls.update();
              renderer.render(scene, camera);
            }
            animate();

            setLoading(false);
          } catch (error) {
            console.error('Error processing STL:', error);
            setError('Failed to process model');
            setLoading(false);
          }
        };

        reader.readAsArrayBuffer(fileToLoad);

      } catch (err) {
        console.error('Error loading model:', err);
        setError(`Failed to load model: ${err.message}`);
        setLoading(false);
      }
    };

    loadModelFile();

    return () => {
      if (rendererRef.current) {
        if (containerRef.current?.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [modelFile]);

  const takeScreenshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return
    const screenshot = rendererRef.current.domElement.toDataURL('image/png')
    if (onPartSelect) {
      onPartSelect({
        screenshot,
        position: cameraRef.current.position.toArray()
      })
    }
  }

  return (
    <div className="relative w-full h-[500px]">
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg overflow-hidden bg-gray-50"
        style={{ touchAction: 'none' }}
      />
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          takeScreenshot()
        }}
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
      >
        Take Screenshot
      </button>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-4 text-sm text-gray-600">Loading model...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 text-sm text-gray-500">
        Tip: Position the model as desired and click Take Screenshot.
      </div>
    </div>
  )
}