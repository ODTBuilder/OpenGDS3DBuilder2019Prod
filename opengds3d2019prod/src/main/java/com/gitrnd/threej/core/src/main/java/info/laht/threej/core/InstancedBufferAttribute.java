/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import java.util.List;

/**
 *
 * @author laht
 */
public class InstancedBufferAttribute extends BufferAttribute {
    
    public int meshPerAttribute;

    public InstancedBufferAttribute(List<Number> array, int itemSize) {
        this(array, itemSize, 1);
    }
    
    public InstancedBufferAttribute(List<Number> array, int itemSize, int meshPerAttribute) {
        super(array, itemSize);
        
        this.meshPerAttribute = meshPerAttribute;
        
    }

    public InstancedBufferAttribute copy(InstancedBufferAttribute source) {
        super.copy(source);

        this.meshPerAttribute = source.meshPerAttribute;
        
        return this;
    }
    
    
}
