/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.scenes;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import java.io.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Fog implements Serializable {
    
    public String name;
    
    public Color color;
    
    public double near, far;
    
    public Fog(Color color, double near, double far) {
        this.name = "";
        this.color = color;
     
        this.near = near;
        this.far = far;
        
    }
    
    public Fog copy() {
        return new Fog(color.copy(), near, far);
    }
    
}
