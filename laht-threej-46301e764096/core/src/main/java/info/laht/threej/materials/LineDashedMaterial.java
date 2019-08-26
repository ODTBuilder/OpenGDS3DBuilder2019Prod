/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.materials;

import org.apache.commons.lang3.tuple.Pair;

/**
 *
 * @author laht
 */
public class LineDashedMaterial extends Material {

    public LineDashedMaterial(Pair<String, Object> ... parameters) {
        
        type = "LineDashedMaterial";
        
        lights = false;
        
        setValues(parameters);
    }
    
    
    
}
