/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.lights;

import info.laht.threej.cameras.*;

/**

 @author Lars Ivar Hatledal laht@ntnu.no.
 */
public class DirectionalLightShadow extends LightShadow {
    
    public DirectionalLightShadow() {
        super(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));
    }
    
}
