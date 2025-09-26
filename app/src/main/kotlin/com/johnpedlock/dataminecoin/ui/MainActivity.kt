package com.johnpedlock.dataminecoin.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.johnpedlock.dataminecoin.ui.screens.MainNav
import com.johnpedlock.dataminecoin.ui.theme.DataMineCoinTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DataMineCoinTheme {
                MainNav()
            }
        }
    }
}