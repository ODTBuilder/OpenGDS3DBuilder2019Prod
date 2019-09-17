/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.*;
import java.io.*;
import java.util.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class Uniforms implements Serializable, Iterable<Uniform> {

    private final Map<String, Uniform> uniforms;

    public Uniforms(Uniform[] uniforms) {
        this.uniforms = new HashMap<>();
        for (Uniform u : uniforms) {
            add(u);
        }
    }

    public void add(String name, Object value) {
        add(new Uniform(name, value));
    }

    public void add(Uniform uniform) {
        uniforms.put(uniform.getName(), uniform);
    }

    public Uniform get(String name) {
        return uniforms.get(name);
    }

    public Collection<Uniform> values() {
        return uniforms.values();
    }

    public static Uniforms merge(Uniforms ... uniforms) {

        List<Uniform> list = new ArrayList<>();
        
        for (Uniforms u1 : uniforms) {
            for (Uniform u2 : u1) {
            list.add(u2.copy());
            }
        }
        
        return new Uniforms(list.toArray(new Uniform[list.size()]));

    }

    @Override
    public Iterator<Uniform> iterator() {
        return values().iterator();
    }

}
