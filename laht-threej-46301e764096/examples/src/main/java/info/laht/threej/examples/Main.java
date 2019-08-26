/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.examples;

import info.laht.threej.scenes.Scene;
import info.laht.threej.cameras.*;
import info.laht.threej.controls.*;
import info.laht.threej.core.*;
import info.laht.threej.renderers.*;
import java.util.logging.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Main {
    
    private Scene scene = new Scene();
    private Camera camera = new PerspectiveCamera(55, 4/3, 0.1, 1000);
    private OrbitControls controls = new OrbitControls(camera);

    
    public void init() {
        
       
        
    }
    
    public void render() {
        
        controls.update();
       
        
    }
    
    
    public static void main(String[] args) {
        
        new Main().init();
        
    }
    
}
