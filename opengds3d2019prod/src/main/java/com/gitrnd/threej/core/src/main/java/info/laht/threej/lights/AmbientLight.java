/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.lights;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class AmbientLight extends Light {

    public AmbientLight(Color color) {
        this(color, 1);
    }

    public AmbientLight(Color color, double intensity) {
        super(color, intensity);
        
        type = "AmbientLight";
    }

}
