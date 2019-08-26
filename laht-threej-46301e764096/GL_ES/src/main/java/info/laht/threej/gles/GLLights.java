/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gles;

import info.laht.threej.core.Uniform;
import info.laht.threej.core.Uniforms;
import info.laht.threej.lights.Light;
import info.laht.threej.math.Color;
import info.laht.threej.math.Vector2d;
import info.laht.threej.math.Vector3d;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author laht
 */
public class GLLights {
    
    private final Map<Integer, Uniforms> lights = new HashMap<>();
    
    public Uniforms get(Light light) {
        
        if (lights.containsKey(light.id)) {
            return lights.get(light.id);
        }
        
        Uniforms uniforms = null;
        
        switch(light.type) {
            
                
            case "DirectionalLight":
                uniforms = new Uniforms(new Uniform[]{
                
                    new Uniform("direction", new Vector3d()),
                    new Uniform("color", new Color()),
                    
                    new Uniform("shadow", false),
                    new Uniform("shadowBias", 0),
                    new Uniform("shadowRadius", 1),
                    new Uniform("shadowMapSize", new Vector2d())
                
                });
                break;
            case "SpotLight":
                uniforms = new Uniforms(new Uniform[]{
                
                    new Uniform("position", new Vector3d()),
                    new Uniform("direction", new Vector3d()),
                    new Uniform("color", new Color()),
                    new Uniform("distance", 0),
                    new Uniform("coseCos", 0),
                    new Uniform("penumbraCos", 0),
                    new Uniform("decay", 0),
                    
                    new Uniform("shadow", false),
                    new Uniform("shadowBias", 0),
                    new Uniform("shadowRadius", 1),
                    new Uniform("shadowMapSize", new Vector2d())
                
                });
                break;
            case "pointLight": 
                 uniforms = new Uniforms(new Uniform[]{
                
                    new Uniform("position", new Vector3d()),
                    new Uniform("color", new Color()),
                    new Uniform("distance", 0),
                    new Uniform("decay", 0),
                    
                    new Uniform("shadow", false),
                    new Uniform("shadowBias", 0),
                    new Uniform("shadowRadius", 1),
                    new Uniform("shadowMapSize", new Vector2d())
                
                });
                break;
                
        }
        
        lights.put(light.id, uniforms);
        
        return uniforms;
        
    }
    
}
