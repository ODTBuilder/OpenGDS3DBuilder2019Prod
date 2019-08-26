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
public class FogExp2 implements Serializable {
    
    public String name;
    
    public Color color;
    private double density;
    
    public FogExp2(Color color, double density) {
        
        this.name = "";
        this.color = color;
        this.density = density;
        
    }
    
    public FogExp2 copy() {
        return new FogExp2(color.copy(), density);
    }
    
}
