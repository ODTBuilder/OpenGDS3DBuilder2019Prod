/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package info.laht.threej.gles;

import java.util.StringJoiner;

/**
 *
 * @author laht
 */
public class GLShader {
    
    private static String addLineNumbers(String string) {
        String[] lines = string.split("\n");
        
        StringJoiner joiner = new StringJoiner("\n");
        for (int i = 0; i < lines.length; i++) {
            joiner.add(( i + 1 ) + ": " + lines[ i ]);
        }

        return joiner.toString();
        
    }
    
}
