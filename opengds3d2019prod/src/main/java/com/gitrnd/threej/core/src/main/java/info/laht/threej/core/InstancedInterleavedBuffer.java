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
public class InstancedInterleavedBuffer extends InterleavedBuffer {

    public int meshPerAttribute;
    
    public InstancedInterleavedBuffer(List<Number> array, int stride) {
        this(array, stride, 1);
    }
    
    public InstancedInterleavedBuffer(List<Number> array, int stride, int meshPerAttribute) {
        super(array, stride);
        
        this.meshPerAttribute = meshPerAttribute;
        
    }
    
    public InstancedInterleavedBuffer copy(InstancedInterleavedBuffer source) {
        super.copy(source);
        
        this.meshPerAttribute = source.meshPerAttribute;
        
        return this;
        
    }
    
}
