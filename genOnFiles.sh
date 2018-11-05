#!/bin/bash

ls -a   | sort \
        | sed -n '/^v/p' \
        | awk '\
            BEGIN  {print "print \047 Generating views for reporting. \047" } \
                    {print ":r .\\" $0} \
            END     {print "print \047Views Generated.\047"}'
