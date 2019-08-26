/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import java.io.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Layers implements Serializable {
    
    protected int mask = 1;
    
    public void set(int channel) {
        this.mask = 1 << channel;
    }
    
    public void enable(int channel) {
        this.mask |= 1 << channel;
    }
    
    public void toggle(int channel) {
        this.mask ^= 1 << channel;
    }
    
    public void disable(int channel) {
        this.mask &= ~ (1 << channel);
    }
    
    public boolean test(Layers layers) {
        return (this.mask & layers.mask) != 0; 
    }
    
}
