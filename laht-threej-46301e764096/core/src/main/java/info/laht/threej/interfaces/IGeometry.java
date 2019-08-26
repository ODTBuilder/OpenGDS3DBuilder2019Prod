/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.interfaces;

import info.laht.threej.math.Angle;
import info.laht.threej.math.Box3d;
import info.laht.threej.math.Matrix4d;
import info.laht.threej.math.Sphere;
import java.io.Serializable;
import java.util.UUID;

/**
 *
 * @author laht
 */
public interface IGeometry extends Serializable {
    
    public UUID getUuid();
    
    public String getName();
    
    public void setName(String name);
    
    public void applyMatrix(Matrix4d m);
    
    public void rotateX(Angle angle);
    
    public void rotateY(Angle angle);
    
    public void rotateZ(Angle angle);
    
    public Box3d getBoundingBox();
    
    public Sphere getBoundingSphere();
    
    public void computeBoundingBox();
    
    public void computeBoundingSphere();
    
}
