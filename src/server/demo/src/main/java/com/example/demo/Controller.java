package com.example.demo;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController 
public class Controller {

    @RequestMapping("/hello")
    public String hello(){
        return "Hello World";
    }
}
