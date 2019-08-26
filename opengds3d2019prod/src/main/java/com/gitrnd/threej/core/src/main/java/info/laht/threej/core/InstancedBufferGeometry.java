/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import java.util.List;
import java.util.Map;

/**
 *
 * @author laht
 */
public class InstancedBufferGeometry extends BufferGeometry {
    
    Integer maxInstancedCount = null;
    
    public InstancedBufferGeometry() {
        
        type = "InstancedBufferGeometry";
    }
    
    public void addGroup(int start, int count) {
        addGroup(start, count, null);
    }
    
    public void addGroup(int start, int count, Integer materialIndex) {
        
        groups.add(new GeometryGroup(start, count, materialIndex));
        
    }
    
    InstancedBufferGeometry copy(InstancedBufferGeometry source) {
        BufferAttribute.IntBufferAttribute index = source.index;
        
        if (index != null) {
            
            this.setIndex((BufferAttribute.IntBufferAttribute) index.copy());
            
        }
        
        Map<String, BufferAttribute> attributes = source.attributes;
        
        for (String name : attributes.keySet()) {
            
            BufferAttribute attribute = attributes.get(name);
            this.addAttribute(name, attribute.copy());
            
        }
        
        List<GeometryGroup> groups = source.groups;
        
        for (int i = 0, l = groups.size(); i < l; i++) {
            
            GeometryGroup group = groups.get(i);
            this.addGroup(group.start, group.count, group.materialIndex);
            
        }
        
        return this;
    }
    
}
