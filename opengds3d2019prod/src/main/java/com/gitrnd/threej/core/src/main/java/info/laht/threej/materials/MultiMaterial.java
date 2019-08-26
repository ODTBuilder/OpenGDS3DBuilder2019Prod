/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.materials;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 *
 * @author laht
 */
public class MultiMaterial {
    
    public final UUID uuid = UUID.randomUUID();
    
    public String type = "MultiMaterial";
    
    private final List<Material> materials;
    
    public boolean visible = true;
    
    private MultiMaterial() {
        this(new ArrayList<>());
    }
    
    public MultiMaterial(List<Material> materials) {
        this.materials = materials;
    }
    
    public MultiMaterial copy() {
        
        MultiMaterial material = new MultiMaterial();
        for (int i = 0; i < this.materials.size(); i++) {
            material.materials.add(this.materials.get(i).copy());
        }
        material.visible = visible;
        
        return material;
    }
    
}
