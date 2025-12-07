package com.momo.backend.entity.enums;

public enum AssignmentStatus  {
    PENDING,       // Manager erstellt Task
    ACCEPTED,      // Employee hat angenommen
    DECLINED,      // Employee lehnt ab
    EXPIRED        // Zeit zur Antwort ist abgelaufen
}