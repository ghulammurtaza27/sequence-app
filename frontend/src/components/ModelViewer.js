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
  const [currentAnimation, setCurrentAnimation] = useState(null);

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
        scene.background = new THREE.Color(0x1f2937);

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
              color: 0x9ca3af,
              specular: 0x666666,
              shininess: 100
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

    return cleanup;
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

  const previewStep = (step) => {
    if (!step.partId || !step.animation) return;
    
    const part = scene.getObjectById(step.partId);
    if (!part) return;

    const { type, axis, value, speed } = step.animation;
    
    // Reset previous animations
    if (currentAnimation) {
      cancelAnimationFrame(currentAnimation);
    }

    if (type === 'translate') {
      const animate = () => {
        const target = new THREE.Vector3();
        target[axis] = value;
        part.position.lerp(target, 0.1 * speed);
        
        if (part.position[axis] !== value) {
          setCurrentAnimation(requestAnimationFrame(animate));
        }
      };
      animate();
    }
    
    if (type === 'rotate') {
      const animate = () => {
        const target = new THREE.Euler();
        target[axis] = THREE.MathUtils.degToRad(value);
        part.rotation[axis] = THREE.MathUtils.lerp(
          part.rotation[axis],
          target[axis],
          0.1 * speed
        );
        
        if (part.rotation[axis] !== target[axis]) {
          setCurrentAnimation(requestAnimationFrame(animate));
        }
      };
      animate();
    }
  };

  return (
    <div className="relative w-full h-[600px]">
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-xl overflow-hidden bg-gray-800 border border-gray-700"
        style={{ touchAction: 'none' }}
      />
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          takeScreenshot()
        }}
        className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 
          hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl
          shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
          focus:ring-offset-gray-800"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Take Screenshot
      </button>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 
              rounded-full animate-spin mx-auto"/>
            <p className="mt-4 text-gray-300 font-medium">Loading model...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-red-500/20 max-w-md mx-4">
            <div className="flex items-center gap-3 text-red-400 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Error Loading Model</span>
            </div>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-gray-800/90 backdrop-blur-sm px-4 py-2 
        rounded-lg border border-gray-700 shadow-lg">
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">Position the model and click Take Screenshot</span>
        </div>
      </div>
    </div>
  )
}