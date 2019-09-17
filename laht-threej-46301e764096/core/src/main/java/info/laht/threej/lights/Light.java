/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.lights;

import info.laht.threej.math.Color;
import info.laht.threej.core.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public abstract class Light extends Object3D {
    
    public String type = null;

    public double intensity;
    public Color color;

    public Light(Color color) {
        this(color, 1);
    }

    public Light(Color color, double intensity) {
        this.intensity = intensity;
        this.color = color;
    }

    public Light copy(Light source) {
        this.intensity = source.intensity;
        this.color.copy(source.color);

        return this;
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "{" + "intensity=" + intensity + ", color=" + color + '}';
    }

}
