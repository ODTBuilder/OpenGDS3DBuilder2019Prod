/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.core;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.interfaces.*;
import java.io.Serializable;
import java.util.*;

/**
 Uniforms are global GLSL variables. They are passed to shader programs.

 @author laht
 */
public class Uniform implements Serializable, Copyable {

    private final String name;
    private Object value;

    public Uniform(String name, Object value) {
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }
    
    public Uniform copy() {
        
        if (value instanceof Copyable) {
            return new Uniform(name, ((Copyable) value).copy());
        } else if (value instanceof List) {
            List valueAsList = (List) value;
            List newList = new ArrayList<>(valueAsList.size());
            for (Object o : valueAsList) {
                if (o instanceof Copyable) {
                    newList.add(((Copyable) o).copy());
                } else {
                    newList.add(o);
                }
            }
            
            return new Uniform(name, newList);
        }
        
        return new Uniform(name, value);
        
    }

    @Override
    public String toString() {
        return "Uniform{" + "name=" + name + ", value=" + value + '}';
    }

}
