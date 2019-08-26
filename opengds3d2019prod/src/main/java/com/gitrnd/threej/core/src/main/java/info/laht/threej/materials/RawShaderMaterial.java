/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.materials;

import org.apache.commons.lang3.tuple.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class RawShaderMaterial extends ShaderMaterial {

    public RawShaderMaterial(Pair<String, Object>... values) {
        super(values);
        
        type = "RawShaderMaterial";
        
    }

}
