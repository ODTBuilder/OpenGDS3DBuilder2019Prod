/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.materials;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.Color;
import org.apache.commons.lang3.tuple.*;

/**
 *
 * @author laht
 */
public class LineBasicMaterial extends Material {

    public Color color = new Color().set("#ffffff");

    public double linewidth = 1;
    public String linecap = "round";
    public String linejoin = "round";

    public LineBasicMaterial(Pair<String, Object> ... values) {
        
        type = "LineBasicMaterial";
        
        lights = false;
        
        setValues(values);
    }

    public LineBasicMaterial copy(LineBasicMaterial source) {
        super.copy(source);

        this.color.copy(source.color);

        this.linewidth = source.linewidth;
        this.linecap = source.linecap;
        this.linejoin = source.linejoin;

        return this;

    }

}
