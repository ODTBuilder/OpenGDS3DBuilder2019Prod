/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.gitrnd.threej.core.src.main.java.info.laht.threej.objects;

import com.gitrnd.threej.core.src.main.java.info.laht.threej.core.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.materials.*;
import com.gitrnd.threej.core.src.main.java.info.laht.threej.math.*;
import org.apache.commons.lang3.tuple.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class LineSegments extends Line {

    public LineSegments() {
        this(new BufferGeometry(), new LineBasicMaterial(
             new ImmutablePair<>("color", new Color().random().multiply(new Color().set("#ffffff"))))
        );
    }

    public LineSegments(BufferGeometry geometry, Material material) {
        super(geometry, material);
        
        type = "LineSegments";
        
    }

}
