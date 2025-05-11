<?php

namespace App\Http\Controllers;

use App\Actions\Search\GlobalSearchAction;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Unified search endpoint for all resource types.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        return GlobalSearchAction::run($request);
    }
} 